import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ---------- AUTH ----------
  userData: null,
  authLoading: true,      // ⏳ very important (refresh issue fix)

  // ---------- LOCATION ----------
  currentCity: null,
  currentState: null,
  currentAddress: null,

  // ---------- SHOP / ITEMS ----------
  shopInMyCity: null,
  itemsInMyCity: null,

  // ---------- CART ----------
  cartItems: [],
  totalAmount: 0,

  // ---------- ORDERS ----------
  myOrders: [],
  searchItems: null,

  // ---------- SOCKET FLAGS ----------
  isSocketConnected: false,
  socketId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ===== AUTH =====
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.authLoading = false;   // ✅ stop loading after success
    },

    logout: (state) => {
      state.userData = null;
      state.authLoading = false;   // ✅ stop loading after failure
    },

    // ===== LOCATION =====
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },

    // ===== SHOPS / ITEMS =====
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },

    // ===== CART =====
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existing = state.cartItems.find(i => i.id === cartItem.id);

      if (existing) {
        existing.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(i => i.id === id);

      if (item) item.quantity = quantity;

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(
        i => i.id !== action.payload
      );

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    // ===== ORDERS =====
    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find(o => o._id === orderId);

      if (order && order.shopOrders?.shop?._id === shopId) {
        order.shopOrders.status = status;
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find(o => o._id === orderId);

      if (order) {
        const shopOrder = order.shopOrders.find(
          so => so.shop._id === shopId
        );
        if (shopOrder) shopOrder.status = status;
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },

    // ===== SOCKET FLAGS =====
    setSocketConnected: (state, action) => {
      state.isSocketConnected = action.payload;
    },

    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },
  },
});

export const {
  // auth
  setUserData,
  logout,

  // location
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,

  // shop / items
  setShopsInMyCity,
  setItemsInMyCity,

  // cart
  addToCart,
  updateQuantity,
  removeCartItem,
  setTotalAmount,

  // orders
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  updateRealtimeOrderStatus,
  setSearchItems,

  // socket
  setSocketConnected,
  setSocketId,
} = userSlice.actions;

export default userSlice.reducer;