'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/mongodb';
import { Run } from '@/lib/db/models/Run';
import { User } from '@/lib/db/models/User';
import { Item } from '@/lib/db/models/Item';
import { getCurrentUserId } from '@/lib/auth';
import mongoose from 'mongoose';

export interface CreateRunInput {
  vendorName: string;
  departureMinutes: number;
  note?: string;
}

export interface RunWithDetails {
  id: string;
  vendorName: string;
  runnerUserId: string;
  runnerName: string;
  departureTime: string;
  note?: string;
  status: 'open' | 'closed' | 'completed';
  itemCount: number;
  createdAt: string;
}

/**
 * Create a new run
 */
export async function createRun(data: CreateRunInput) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    // Validate input
    if (!data.vendorName || data.vendorName.trim().length < 2) {
      return { success: false, error: 'Vendor name must be at least 2 characters' };
    }

    if (!data.departureMinutes || data.departureMinutes < 1) {
      return { success: false, error: 'Departure time must be at least 1 minute' };
    }

    // Calculate departure time
    const departureTime = new Date(Date.now() + data.departureMinutes * 60 * 1000);

    // Get runner info for email
    const runner = await User.findById(userId);
    if (!runner) {
      return { success: false, error: 'User not found' };
    }

    // Create run
    const run = await Run.create({
      vendorName: data.vendorName.trim(),
      runnerUserId: userId,
      departureTime,
      note: data.note?.trim(),
      status: 'open',
    });

    console.log('🎯 Run created, triggering email notifications...');

    // Send email notifications (don't block on this)
    // Import dynamically to avoid circular dependencies
    import('@/lib/email/resend').then(({ notifyUsersAboutNewRun }) => {
      console.log('📧 Email module loaded, calling notifyUsersAboutNewRun...');
      notifyUsersAboutNewRun(
        {
          vendorName: run.vendorName,
          runnerName: runner.name,
          departureTime: run.departureTime.toISOString(),
          runId: run._id.toString(),
          note: run.note,
        },
        userId
      ).then(({ sent, failed }) => {
        console.log(`✅ Email notifications complete: ${sent} sent, ${failed} failed`);
      }).catch((error) => {
        console.error('❌ Failed to send email notifications:', error);
      });
    }).catch((error) => {
      console.error('❌ Failed to import email module:', error);
    });

    revalidatePath('/');
    return { success: true, runId: run._id.toString() };
  } catch (error) {
    console.error('Create run error:', error);
    return { success: false, error: 'Failed to create run' };
  }
}

/**
 * Get all active runs (open or closed, not completed)
 */
export async function getActiveRuns(): Promise<RunWithDetails[]> {
  try {
    await dbConnect();

    const runs = await Run.find({
      status: { $in: ['open', 'closed'] },
    })
      .sort({ departureTime: 1 })
      .populate('runnerUserId', 'name')
      .lean();

    // Get item counts for each run
    const runIds = runs.map((run) => run._id);
    const itemCounts = await Item.aggregate([
      { $match: { runId: { $in: runIds } } },
      { $group: { _id: '$runId', count: { $sum: 1 } } },
    ]);

    const itemCountMap = new Map(
      itemCounts.map((item) => [item._id.toString(), item.count])
    );

    return runs.map((run) => ({
      id: run._id.toString(),
      vendorName: run.vendorName,
      runnerUserId: run.runnerUserId._id.toString(),
      runnerName: (run.runnerUserId as any).name,
      departureTime: run.departureTime.toISOString(),
      note: run.note,
      status: run.status,
      itemCount: itemCountMap.get(run._id.toString()) || 0,
      createdAt: run.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Get active runs error:', error);
    return [];
  }
}

/**
 * Get a single run by ID with full details
 */
export async function getRunById(runId: string) {
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(runId)) {
      return null;
    }

    const run = await Run.findById(runId)
      .populate('runnerUserId', 'name')
      .lean();

    if (!run) return null;

    // Get items for this run
    const items = await Item.find({ runId })
      .populate('userId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    return {
      id: run._id.toString(),
      vendorName: run.vendorName,
      runnerUserId: run.runnerUserId._id.toString(),
      runnerName: (run.runnerUserId as any).name,
      departureTime: run.departureTime.toISOString(),
      note: run.note,
      status: run.status,
      createdAt: run.createdAt.toISOString(),
      items: items.map((item) => ({
        id: item._id.toString(),
        runId: item.runId.toString(),
        userId: item.userId._id.toString(),
        userName: (item.userId as any).name,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isPaid: item.isPaid,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get run by ID error:', error);
    return null;
  }
}

/**
 * Close a run (no more items can be added)
 */
export async function closeRun(runId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    const run = await Run.findById(runId);
    if (!run) {
      return { success: false, error: 'Run not found' };
    }

    // Only runner can close the run
    if (run.runnerUserId.toString() !== userId) {
      return { success: false, error: 'Only the runner can close this run' };
    }

    run.status = 'closed';
    await run.save();

    revalidatePath('/');
    revalidatePath(`/runs/${runId}`);
    return { success: true };
  } catch (error) {
    console.error('Close run error:', error);
    return { success: false, error: 'Failed to close run' };
  }
}

/**
 * Complete a run (archived, no longer shown)
 */
export async function completeRun(runId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    const run = await Run.findById(runId);
    if (!run) {
      return { success: false, error: 'Run not found' };
    }

    // Only runner can complete the run
    if (run.runnerUserId.toString() !== userId) {
      return { success: false, error: 'Only the runner can complete this run' };
    }

    run.status = 'completed';
    await run.save();

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Complete run error:', error);
    return { success: false, error: 'Failed to complete run' };
  }
}
