'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db/mongodb';
import { Item } from '@/lib/db/models/Item';
import { Run } from '@/lib/db/models/Run';
import { getCurrentUserId } from '@/lib/auth';
import mongoose from 'mongoose';

export interface CreateItemInput {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface UpdateItemInput {
  name?: string;
  quantity?: number;
  price?: number;
  notes?: string;
}

/**
 * Add an item to a run
 */
export async function addItem(runId: string, data: CreateItemInput) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    // Validate run exists and is open
    const run = await Run.findById(runId);
    if (!run) {
      return { success: false, error: 'Run not found' };
    }

    if (run.status !== 'open') {
      return { success: false, error: 'This run is no longer accepting items' };
    }

    // Validate input
    if (!data.name || data.name.trim().length < 1) {
      return { success: false, error: 'Item name is required' };
    }

    if (!data.quantity || data.quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    if (data.price < 0) {
      return { success: false, error: 'Price must be non-negative' };
    }

    // Create item
    const item = await Item.create({
      runId,
      userId,
      name: data.name.trim(),
      quantity: data.quantity,
      price: data.price,
      notes: data.notes ? data.notes.trim() : undefined,
      isPaid: false,
    });

    revalidatePath(`/runs/${runId}`);
    revalidatePath('/');
    
    // Send email notification to the runner
    try {
      // Get the runner's info
      const { User } = await import('@/lib/db/models/User');
      const runner = await User.findById(run.runnerUserId);
      
      // Don't notify if the runner is adding an item to their own run
      if (runner && runner._id.toString() !== userId && runner.notificationsEnabled && runner.email) {
        // Get the requester's name
        const requester = await User.findById(userId);
        
        if (requester) {
          console.log('📧 Triggering item added email notification...');
          const { sendItemAddedEmail } = await import('@/lib/email/resend');
          
          await sendItemAddedEmail(runner.email, {
            runnerName: runner.name,
            runnerEmail: runner.email,
            requesterName: requester.name,
            itemName: item.name,
            quantity: item.quantity,
            runId: runId,
            vendorName: run.vendorName,
          });
        }
      }
    } catch (error) {
      // Don't fail the request if email fails, but log it
      console.error('❌ Failed to send item added email notification:', error);
    }
    
    return { 
      success: true, 
      itemId: item._id.toString(),
      item: {
        id: item._id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }
    };
  } catch (error) {
    console.error('Add item error:', error);
    return { success: false, error: 'Failed to add item' };
  }
}

/**
 * Update an item
 */
export async function updateItem(itemId: string, data: UpdateItemInput) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: 'Invalid item ID' };
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check ownership
    if (item.userId.toString() !== userId) {
      return { success: false, error: 'You can only edit your own items' };
    }

    // Check if run is still open
    const run = await Run.findById(item.runId);
    if (!run || run.status !== 'open') {
      return { success: false, error: 'Cannot edit items in a closed run' };
    }

    // Update fields
    if (data.name !== undefined) {
      if (data.name.trim().length < 1) {
        return { success: false, error: 'Item name cannot be empty' };
      }
      item.name = data.name.trim();
    }

    if (data.quantity !== undefined) {
      if (data.quantity < 1) {
        return { success: false, error: 'Quantity must be at least 1' };
      }
      item.quantity = data.quantity;
    }

    if (data.price !== undefined) {
      if (data.price < 0) {
        return { success: false, error: 'Price must be non-negative' };
      }
      item.price = data.price;
    }

    if (data.notes !== undefined) {
      if (data.notes.length > 500) {
        return { success: false, error: 'Notes must be less than 500 characters' };
      }
      item.notes = data.notes.trim() || undefined;
    }

    await item.save();

    revalidatePath(`/runs/${item.runId.toString()}`);
    return { success: true };
  } catch (error) {
    console.error('Update item error:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: 'Invalid item ID' };
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check ownership
    if (item.userId.toString() !== userId) {
      return { success: false, error: 'You can only delete your own items' };
    }

    // Check if run is still open
    const run = await Run.findById(item.runId);
    if (!run || run.status !== 'open') {
      return { success: false, error: 'Cannot delete items in a closed run' };
    }

    const runId = item.runId.toString();

    // Send email notification to the runner BEFORE deleting
    try {
      // Get the runner's info
      const { User } = await import('@/lib/db/models/User');
      const runner = await User.findById(run.runnerUserId);
      
      // Don't notify if the runner is deleting their own item
      if (runner && runner._id.toString() !== userId && runner.notificationsEnabled && runner.email) {
        // Get the requester's name (the one deleting the item)
        const requester = await User.findById(userId);
        
        if (requester) {
          console.log('📧 Triggering item deleted email notification...');
          const { sendItemDeletedEmail } = await import('@/lib/email/resend');
          
          await sendItemDeletedEmail(runner.email, {
            runnerName: runner.name,
            runnerEmail: runner.email,
            requesterName: requester.name,
            itemName: item.name,
            quantity: item.quantity,
            runId: runId,
            vendorName: run.vendorName,
          });
        }
      }
    } catch (error) {
      // Don't fail the request if email fails, but log it
      console.error('❌ Failed to send item deleted email notification:', error);
    }

    await item.deleteOne();

    revalidatePath(`/runs/${runId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete item error:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

/**
 * Toggle item paid status (runner only)
 */
export async function toggleItemPaid(itemId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: 'Invalid item ID' };
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Check if user is the runner
    const run = await Run.findById(item.runId);
    if (!run) {
      return { success: false, error: 'Run not found' };
    }

    if (run.runnerUserId.toString() !== userId) {
      return { success: false, error: 'Only the runner can mark items as paid' };
    }

    item.isPaid = !item.isPaid;
    await item.save();

    revalidatePath(`/runs/${item.runId.toString()}`);
    return { success: true, isPaid: item.isPaid };
  } catch (error) {
    console.error('Toggle item paid error:', error);
    return { success: false, error: 'Failed to toggle paid status' };
  }
}
