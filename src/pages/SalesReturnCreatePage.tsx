import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Search,
  ChevronLeft,
  Plus,
  Minus,
  X,
  Info,
  Package,
  CheckCircle2,
  Trash2,
  Pencil,
} from "lucide-react";
import { productService } from "@/services/product.service";
import { customerService } from "@/services/customer.service";
import type { Product, Category } from "@/types/product";
import type { Customer } from "@/types/customer";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/store/useToast";
import { salesService } from "@/services/sales.service";

interface CartItem {
  product: Product;
  qty: number;
  fractionQty: number;
  focQty: number;
  totalPcs: number;
  subtotal: number;
  dutyAmount: number;
  vatAmount: number;
  taxAmount: number;
  total: number;
}

export function SalesReturnCreatePage() {
  const { xcus } = useParams<{ xcus: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Qty input state for modal
  const [modalQty, setModalQty] = useState<string>("1");
  const [modalFractionQty, setModalFractionQty] = useState<string>("0");
  const [modalFocQty, setModalFocQty] = useState<string>("0");

  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuthStore();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!xcus) return;
      setLoading(true);
      try {
        const [customerData, productsData, categoriesData] = await Promise.all([
          customerService.getCustomerById(xcus),
          productService.getProducts(),
          productService.getCategories(),
        ]);
        setCustomer(customerData);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [xcus]);

  // Scroll to top when category or search term changes
  useEffect(() => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedCategory, searchTerm]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.xdesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.xitem.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || p.xdiv === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const calculateItem = (
    product: Product,
    qty: number,
    fractionQty: number,
    focQty: number,
  ): CartItem => {
    const cf = parseFloat(product.xcfsel) || 1;
    const price = parseFloat(product.xstdprice) || 0;
    const duty = parseFloat(product.xdutychg) || 0;
    const vat = parseFloat(product.xvatchg) || 0;

    const subtotalTotalPcs = cf * qty + fractionQty;
    const subtotal = subtotalTotalPcs * price;
    const dutyAmount = (subtotal * duty) / 100;
    const vatAmount = (subtotal * vat) / 100;
    const taxAmount = dutyAmount + vatAmount;
    const total = subtotal + taxAmount;

    const totalPcs = subtotalTotalPcs + focQty;

    return {
      product,
      qty,
      fractionQty,
      focQty,
      totalPcs,
      subtotal,
      dutyAmount,
      vatAmount,
      taxAmount,
      total,
    };
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const qty = parseInt(modalQty) || 0;
    const fraction = parseInt(modalFractionQty) || 0;
    const foc = parseInt(modalFocQty) || 0;

    if (qty === 0 && fraction === 0 && foc === 0) {
      const newCart = { ...cart };
      delete newCart[selectedProduct.xitem];
      setCart(newCart);
    } else {
      const item = calculateItem(selectedProduct, qty, fraction, foc);
      setCart({ ...cart, [selectedProduct.xitem]: item });
    }

    setSelectedProduct(null);
    setModalQty("1");
    setModalFractionQty("0");
    setModalFocQty("0");
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    const existing = cart[product.xitem];
    if (existing) {
      setModalQty(existing.qty.toString());
      setModalFractionQty(existing.fractionQty.toString());
      setModalFocQty(existing.focQty.toString());
    } else {
      setModalQty("1");
      setModalFractionQty("0");
      setModalFocQty("0");
    }
  };

  const cartArray = Object.values(cart);
  const cartTotal = cartArray.reduce((acc, item) => acc + item.total, 0);
  const cartItemsCount = cartArray.length;

  const handleConfirmReturn = async () => {
    if (cartArray.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        xpayamt: Number(cartTotal.toFixed(2)),
        xcus: xcus || "",
        xwh: user?.xwh || "Amin Bazar Ghat",
        xdatecom: new Date().toISOString().split("T")[0],
        xtypeloc: "Return",
        xtotamt: cartTotal.toFixed(2).toString(),
        xnote: remarks,
        xsp: user?.username || "SysAdmin",
        xretvstat: "Confirmed",
        xdtwotax: null,
        xdttax: null,
        xchgtot: null,
        xtrnnum: cartArray.map((item, index) => ({
          xline: index + 1,
          xqtychl: item.totalPcs - item.focQty,
          xqty: item.qty,
          xrate: Number(parseFloat(item.product.xstdprice).toFixed(2)),
          xdtwotax: null,
          xdttax: null,
          xchgtot: null,
          xlineamt: Number(item.total.toFixed(2)),
          xitem: item.product.xitem,
          xunitsel: item.product.xunitsel,
          xwtunit: Number(parseFloat(item.product.xcfsel).toFixed(2)),
          xqtycrn: null,
          xqtyfoc: item.focQty.toString(),
          xdutychg: parseFloat(item.product.xdutychg || "0").toString(),
          xvatchg: parseFloat(item.product.xvatchg || "0").toString(),
        })),
      };

      // console.log(
      //   "Submitting Sales Return Data:",
      //   JSON.stringify(orderData, null, 2),
      // );

      await salesService.createSalesReturn(orderData);
      addToast("Sales return submitted successfully!", "success");

      setCart({});
      setShowSummary(false);
      setRemarks("");
      navigate("/sales-return", { replace: true });
    } catch (error) {
      console.error("Sales return failed", error);
      addToast("Failed to submit sales return. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {customer?.xorg}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              ID: {customer?.xcus} • {customer?.xstate}
            </p>
          </div>
          <button
            onClick={() => setShowSummary(true)}
            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <Package className="h-6 w-6 text-primary" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products for return..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.xcode}
                onClick={() => setSelectedCategory(cat.xdescdet)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.xdescdet
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat.xdescdet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.xitem}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {product.xitem}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {product.xdiv}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
              {product.xdesc}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <Package className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">
                Unit: {product.xunitpur} (
                {parseFloat(product.xcfsel).toFixed(1)} {product.xunitsel}/
                {product.xunitpur})
              </span>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Rate
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  AED {parseFloat(product.xstdprice).toLocaleString()}
                </p>
              </div>

              {cart[product.xitem] ? (
                <button
                  onClick={() => openEditModal(product)}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {(() => {
                    const item = cart[product.xitem];
                    const parts = [];
                    if (item.qty > 0)
                      parts.push(`${item.qty} ${product.xunitpur}`);
                    if (item.fractionQty > 0)
                      parts.push(`${item.fractionQty} ${product.xunitsel}`);
                    if (item.focQty > 0) parts.push(`${item.focQty} FOC`);
                    return parts.length > 0 ? parts.join(" + ") : "0 Items";
                  })()}
                </button>
              ) : (
                <button
                  onClick={() => openEditModal(product)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  ADD
                </button>
              )}
            </div>

            {/* Tax Info Badge */}
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 p-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Info className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Summary Button */}
      {cartItemsCount > 0 && !showSummary && (
        <div className="fixed bottom-[4.5rem] md:bottom-6 left-4 right-4 z-40 animate-in slide-in-from-bottom-8">
          <button
            onClick={() => setShowSummary(true)}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-between px-6 py-4 rounded-[24px] shadow-2xl shadow-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-semibold opacity-60 uppercase tracking-widest">
                  Return Summary
                </p>
                <p className="text-sm font-semibold">
                  {cartItemsCount} Items • AED {cartTotal.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-semibold text-xs">
              VIEW RETURN
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </div>
          </button>
        </div>
      )}

      {/* Quantity Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {selectedProduct.xitem}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-2">
                    {selectedProduct.xdesc}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {selectedProduct.xunitpur} (
                    {parseFloat(selectedProduct.xcfsel).toFixed(1)}{" "}
                    {selectedProduct.xunitsel}/{selectedProduct.xunitpur}) • AED{" "}
                    {parseFloat(selectedProduct.xstdprice).toLocaleString()} per{" "}
                    {selectedProduct.xunitsel}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Return Qty ({selectedProduct.xunitpur})
                    </label>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                      <button
                        onClick={() =>
                          setModalQty(
                            Math.max(0, parseInt(modalQty) - 1).toString(),
                          )
                        }
                        className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        value={modalQty}
                        onChange={(e) => setModalQty(e.target.value)}
                        className="w-full bg-transparent border-none text-center font-semibold text-lg focus:ring-0"
                      />
                      <button
                        onClick={() =>
                          setModalQty((parseInt(modalQty) + 1).toString())
                        }
                        className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Fraction ({selectedProduct.xunitsel})
                      </label>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                        <button
                          onClick={() =>
                            setModalFractionQty(
                              Math.max(
                                0,
                                parseInt(modalFractionQty) - 1,
                              ).toString(),
                            )
                          }
                          className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <input
                          type="number"
                          value={modalFractionQty}
                          onChange={(e) => setModalFractionQty(e.target.value)}
                          className="w-full bg-transparent border-none text-center font-semibold text-lg focus:ring-0"
                        />
                        <button
                          onClick={() =>
                            setModalFractionQty(
                              (parseInt(modalFractionQty) + 1).toString(),
                            )
                          }
                          className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        FOC ({selectedProduct.xunitsel})
                      </label>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                        <button
                          onClick={() =>
                            setModalFocQty(
                              Math.max(0, parseInt(modalFocQty) - 1).toString(),
                            )
                          }
                          className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <input
                          type="number"
                          value={modalFocQty}
                          onChange={(e) => setModalFocQty(e.target.value)}
                          className="w-full bg-transparent border-none text-center font-semibold text-lg focus:ring-0"
                        />
                        <button
                          onClick={() =>
                            setModalFocQty(
                              (parseInt(modalFocQty) + 1).toString(),
                            )
                          }
                          className="p-3 text-primary hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Subtotal</span>
                    <span>
                      AED{" "}
                      {calculateItem(
                        selectedProduct,
                        parseInt(modalQty) || 0,
                        parseInt(modalFractionQty) || 0,
                        parseInt(modalFocQty) || 0,
                      ).subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>
                      Exc. Duty (
                      {parseFloat(selectedProduct.xdutychg).toFixed(1)}%)
                    </span>
                    <span>
                      AED{" "}
                      {calculateItem(
                        selectedProduct,
                        parseInt(modalQty) || 0,
                        parseInt(modalFractionQty) || 0,
                        parseInt(modalFocQty) || 0,
                      ).dutyAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>
                      VAT ({parseFloat(selectedProduct.xvatchg).toFixed(1)}%)
                    </span>
                    <span>
                      AED{" "}
                      {calculateItem(
                        selectedProduct,
                        parseInt(modalQty) || 0,
                        parseInt(modalFractionQty) || 0,
                        parseInt(modalFocQty) || 0,
                      ).vatAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Estimated Return
                    </span>
                    <span className="text-xl font-semibold text-primary">
                      AED{" "}
                      {calculateItem(
                        selectedProduct,
                        parseInt(modalQty) || 0,
                        parseInt(modalFractionQty) || 0,
                        parseInt(modalFocQty) || 0,
                      ).total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary text-white py-4 rounded-3xl font-semibold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {cart[selectedProduct.xitem]
                    ? "UPDATE RETURN"
                    : "ADD TO RETURN"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary View Overlay */}
      {showSummary && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm hidden md:block"
            onClick={() => setShowSummary(false)}
          />
          <div className="relative w-full md:w-[450px] bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSummary(false)}
                  className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  Return Summary
                </h2>
              </div>
              <button
                onClick={() => {
                  setCart({});
                  setRemarks("");
                }}
                className="text-red-500 text-[10px] font-semibold uppercase tracking-widest p-2"
              >
                Clear All
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <Package className="h-16 w-16 mb-4" />
                  <p className="font-semibold">No items selected for return</p>
                </div>
              ) : (
                cartArray.map((item) => (
                  <div
                    key={item.product.xitem}
                    className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.product.xdesc}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.qty} {item.product.xunitpur}{" "}
                          {item.fractionQty > 0
                            ? `+ ${item.fractionQty} ${item.product.xunitsel}`
                            : ""}{" "}
                          {item.focQty > 0 ? `+ ${item.focQty} FOC` : ""}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-semibold text-primary">
                          Total: {item.totalPcs} {item.product.xunitsel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mt-2">
                        AED {item.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <button
                        onClick={() => {
                          const newCart = { ...cart };
                          delete newCart[item.product.xitem];
                          setCart(newCart);
                        }}
                        className="p-2 text-red-500 hover:bg-primary/10 rounded-xl  transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowSummary(false);
                          openEditModal(item.product);
                        }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartArray.length > 0 && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                  <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-700 pb-3 text-[11px] font-medium text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        AED{" "}
                        {cartArray
                          .reduce((acc, i) => acc + i.subtotal, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exc. Duty</span>
                      <span>
                        AED{" "}
                        {cartArray
                          .reduce((acc, i) => acc + i.dutyAmount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT</span>
                      <span>
                        AED{" "}
                        {cartArray
                          .reduce((acc, i) => acc + i.vatAmount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Total Return
                      </span>
                      <span className="text-xl font-bold text-primary">
                        AED {cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Return Reason
                      </label>
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Reason for return..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-primary transition-all p-2 h-9"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmReturn}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    "CONFIRM RETURN"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
