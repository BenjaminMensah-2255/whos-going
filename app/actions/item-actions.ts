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
}

export interface UpdateItemInput {
  name?: string;
  quantity?: number;
  price?: number;
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
      isPaid: false,
    });

    revalidatePath(`/runs/${runId}`);
    revalidatePath('/');
    
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
