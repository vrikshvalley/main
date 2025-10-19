import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  addToCartSupabase,
  updateCartItemSupabase,
  removeFromCartSupabase,
  clearCartFromSupabase,
  loadCartFromSupabase,
  saveCartToLocalStorage,
  loadCartFromLocalStorage,
} from "../cartUtils";
import { supabase } from "../supabaseClient";

// Item shape: { id, title, price, qty, image? }
const initialState = {
  items: {}, // keyed by id
  loading: false,
  error: null,
};

// Async thunks for Supabase operations
export const loadUserCart = createAsyncThunk(
  "cart/loadUserCart",
  async (userId, { rejectWithValue }) => {
    try {
      const cart = await loadCartFromSupabase(userId);
      return cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemAsync = createAsyncThunk(
  "cart/addItemAsync",
  async ({ item, userId }, { rejectWithValue }) => {
    try {
      if (userId) {
        await addToCartSupabase(userId, item.id, item.qty ?? 1);
      }
      return { item, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  "cart/updateItemAsync",
  async ({ productId, quantity, userId }, { rejectWithValue }) => {
    try {
      if (userId) {
        await updateCartItemSupabase(userId, productId, quantity);
      }
      return { productId, quantity, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemAsync = createAsyncThunk(
  "cart/removeItemAsync",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      if (userId) {
        await removeFromCartSupabase(userId, productId);
      }
      return { productId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  "cart/clearCartAsync",
  async (userId, { rejectWithValue }) => {
    try {
      if (userId) {
        await clearCartFromSupabase(userId);
      }
      return { userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const existing = state.items[item.id];
      if (existing) {
        existing.qty += item.qty ?? 1;
      } else {
        state.items[item.id] = { ...item, qty: item.qty ?? 1 };
      }
      // Save to localStorage for guest users
      saveCartToLocalStorage(state.items);
    },
    decrementItem: (state, action) => {
      const id = action.payload;
      const existing = state.items[id];
      if (!existing) return;
      existing.qty -= 1;
      if (existing.qty <= 0) {
        delete state.items[id];
      }
      saveCartToLocalStorage(state.items);
    },
    removeItem: (state, action) => {
      const id = action.payload;
      delete state.items[id];
      saveCartToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = {};
      saveCartToLocalStorage(state.items);
    },
    loadCart: (state, action) => {
      // Load cart from localStorage or Supabase
      state.items = action.payload || {};
    },
    setCart: (state, action) => {
      // Directly set cart items
      state.items = action.payload || {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Load user cart
      .addCase(loadUserCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add item async
      .addCase(addItemAsync.fulfilled, (state, action) => {
        const { item } = action.payload;
        const existing = state.items[item.id];
        if (existing) {
          existing.qty += item.qty ?? 1;
        } else {
          state.items[item.id] = { ...item, qty: item.qty ?? 1 };
        }
      })
      // Update item async
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        if (quantity <= 0) {
          delete state.items[productId];
        } else if (state.items[productId]) {
          state.items[productId].qty = quantity;
        }
      })
      // Remove item async
      .addCase(removeItemAsync.fulfilled, (state, action) => {
        const { productId } = action.payload;
        delete state.items[productId];
      })
      // Clear cart async
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = {};
      });
  },
});

export const {
  addItem,
  decrementItem,
  removeItem,
  clearCart,
  loadCart,
  setCart,
} = cartSlice.actions;

// Selectors
const selectCartState = (state) => state.cart;
export const selectItemsMap = createSelector(
  [selectCartState],
  (cart) => cart.items
);
export const selectItemsArray = createSelector([selectItemsMap], (items) =>
  Object.values(items)
);
export const selectCount = createSelector([selectItemsArray], (arr) =>
  arr.reduce((n, i) => n + i.qty, 0)
);
export const selectSubtotal = createSelector([selectItemsArray], (arr) =>
  arr.reduce((sum, i) => sum + i.price * i.qty, 0)
);
export const selectCartLoading = createSelector(
  [selectCartState],
  (cart) => cart.loading
);

export default cartSlice.reducer;
