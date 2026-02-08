import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { customerService } from "@/services/customer.service";
import { commonService, type CodeParam } from "@/services/common.service";
import type { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Save,
  Building2,
  Phone,
  Tag,
  Hash,
  AlertTriangle,
  X,
} from "lucide-react";
import { useToast } from "@/store/useToast";
import { PageHeader } from "@/components/layout/PageHeader";

export function CustomerCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customer, setCustomer] = useState<Partial<Customer>>({
    xorg: "",
    xtitle: "",
    xfphone: "",
    xstate: "",
    xzone: "",
    xarea: "",
    xadd1: "",
    xmobile: "",
    xemail1: "",
    xagent: "",
    xphone: "",
    xgcus: "",
    xstatuscus: "Open",
    xtaxnum: "",
    xzip: "",
  });

  // Filter Data
  const [states, setStates] = useState<CodeParam[]>([]);
  const [zones, setZones] = useState<CodeParam[]>([]);
  const [areas, setAreas] = useState<CodeParam[]>([]);
  const [groups, setGroups] = useState<CodeParam[]>([]);
  const [statuses, setStatuses] = useState<CodeParam[]>([]);

  const fetchStates = async () => {
    try {
      const data = await commonService.getCodeParams("State");
      setStates(data);
    } catch (error) {
      console.error("Failed to fetch states", error);
    }
  };

  const fetchZones = async (stateCode: string) => {
    try {
      const data = await commonService.getCodeParams("Zone", stateCode);
      setZones(data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
    }
  };

  const fetchAreas = async (zoneCode: string) => {
    try {
      const data = await commonService.getCodeParams("Area", zoneCode);
      setAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await commonService.getCodeParams("CustomerGroup");
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const data = await commonService.getCodeParams("Customer Status");
      setStatuses(data);
    } catch (error) {
      console.error("Failed to fetch statuses", error);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchGroups();
    fetchStatuses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCustomer((prev) => ({ ...prev, [name]: value }));

    if (name === "xstate") {
      setCustomer((prev) => ({ ...prev, xzone: "", xarea: "" }));
      setZones([]);
      setAreas([]);
      fetchZones(value);
    } else if (name === "xzone") {
      setCustomer((prev) => ({ ...prev, xarea: "" }));
      setAreas([]);
      fetchAreas(value);
    }
  };

  const validate = () => {
    const validations = [
      { field: "xorg", label: "Customer Name" },
      { field: "xtitle", label: "Proprietor Name" },
      { field: "xfphone", label: "Mobile Number" },
      { field: "xstate", label: "State" },
    ];

    for (const v of validations) {
      if (!customer[v.field as keyof Customer]) {
        addToast(`${v.label} is required`, "error");
        return false;
      }
    }
    return true;
  };

  const handleCreateRequest = () => {
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  const handleCreate = async () => {
    setShowConfirmModal(false);

    const finalData = { ...customer };

    // Auto address logic
    if (!finalData.xadd1) {
      const parts = [];
      if (finalData.xarea) parts.push(finalData.xarea);
      if (finalData.xzone) parts.push(finalData.xzone);
      if (finalData.xstate) parts.push(finalData.xstate);
      finalData.xadd1 = parts.join(", ");
    }

    setSaving(true);
    try {
      await customerService.createCustomer(finalData);
      addToast("Customer created successfully", "success");
      navigate("/customer-list");
    } catch (error) {
      console.error("Failed to create customer", error);
      addToast("Failed to create customer", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <PageHeader title="Add New Customer" />

      <div className="p-4 md:p-6 mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Basic Info Column */}
          <div className="space-y-3 md:space-y-4">
            <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-none overflow-hidden py-0 gap-0">
              <CardHeader className="px-3 !py-2.5 border-b !pb-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-2 space-y-0">
                <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">
                  General Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="xorg"
                    value={customer.xorg}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Proprietor Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="xtitle"
                    value={customer.xtitle}
                    onChange={handleInputChange}
                    placeholder="Enter owner name"
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    TRN Number
                  </label>
                  <Input
                    name="xtaxnum"
                    value={customer.xtaxnum}
                    onChange={handleInputChange}
                    placeholder="Enter TRN Number"
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-none overflow-hidden py-0 gap-0">
              <CardHeader className="px-3 !py-2.5 border-b !pb-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-2 space-y-0">
                <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Address
                  </label>
                  <Input
                    name="xadd1"
                    value={customer.xadd1}
                    onChange={handleInputChange}
                    placeholder="Leave blank for auto-generation"
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={customer.xstate}
                      onValueChange={(v) => handleSelectChange("xstate", v)}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {states.map((s) => (
                          <SelectItem key={s.xcode} value={s.xcode}>
                            {s.xcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Zone
                    </label>
                    <Select
                      value={customer.xzone}
                      onValueChange={(v) => handleSelectChange("xzone", v)}
                      disabled={!customer.xstate}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {zones.map((z) => (
                          <SelectItem key={z.xcode} value={z.xcode}>
                            {z.xcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Area
                    </label>
                    <Select
                      value={customer.xarea}
                      onValueChange={(v) => handleSelectChange("xarea", v)}
                      disabled={!customer.xzone}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {areas.map((a) => (
                          <SelectItem key={a.xcode} value={a.xcode}>
                            {a.xcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Zip Code
                    </label>
                    <Input
                      name="xzip"
                      value={customer.xzip}
                      onChange={handleInputChange}
                      placeholder="Enter zip code"
                      className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communication Column */}
          <div className="space-y-3 md:space-y-4">
            <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-none overflow-hidden py-0 gap-0">
              <CardHeader className="px-3 !py-2.5 border-b !pb-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-2 space-y-0">
                <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Primary Phone
                    </label>
                    <Input
                      name="xmobile"
                      value={customer.xmobile}
                      onChange={handleInputChange}
                      placeholder="Primary phone"
                      className="h-9 px-3 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="xfphone"
                      value={customer.xfphone}
                      onChange={handleInputChange}
                      placeholder="Personal mobile"
                      className="h-9 px-3 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Email Address
                  </label>
                  <Input
                    name="xemail1"
                    value={customer.xemail1}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="h-9 px-3 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Manager Name
                    </label>
                    <Input
                      name="xagent"
                      value={customer.xagent}
                      onChange={handleInputChange}
                      placeholder="Branch manager"
                      className="h-9 px-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Manager Phone
                    </label>
                    <Input
                      name="xphone"
                      value={customer.xphone}
                      onChange={handleInputChange}
                      placeholder="Manager phone"
                      className="h-9 px-3 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-none overflow-hidden py-0 gap-0">
              <CardHeader className="px-3 !py-2.5 border-b !pb-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center gap-2 space-y-0">
                <Tag className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Customer Group
                    </label>
                    <Select
                      value={customer.xgcus || ""}
                      onValueChange={(v) => handleSelectChange("xgcus", v)}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {groups.map((g) => (
                          <SelectItem key={g.xcode} value={g.xcode}>
                            {g.xcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Status
                    </label>
                    <Select
                      value={customer.xstatuscus}
                      onValueChange={(v) => handleSelectChange("xstatuscus", v)}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {statuses.map((s) => (
                          <SelectItem key={s.xcode} value={s.xcode}>
                            {s.xcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button at Bottom */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleCreateRequest}
            disabled={saving}
            className="w-full max-w-md h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 text-base font-bold"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Create Customer
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !saving && setShowConfirmModal(false)}
          />
          <Card className="relative w-full max-w-sm overflow-hidden rounded-3xl border-none shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Confirm Creation
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to create this customer?
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer Name
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {customer.xorg}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-800 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={saving}
                  className="rounded-xl h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-semibold"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
