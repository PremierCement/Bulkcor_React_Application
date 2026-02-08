import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
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
import { Loader2, Save, Building2, Phone, Tag, Hash } from "lucide-react";
import { useToast } from "@/store/useToast";
import { PageHeader } from "@/components/layout/PageHeader";

export function CustomerDetailsPage() {
  const { xcus } = useParams<{ xcus: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Filter Data
  const [states, setStates] = useState<CodeParam[]>([]);
  const [zones, setZones] = useState<CodeParam[]>([]);
  const [areas, setAreas] = useState<CodeParam[]>([]);
  const [groups, setGroups] = useState<CodeParam[]>([]);
  const [statuses, setStatuses] = useState<CodeParam[]>([]);

  const fetchCustomerData = useCallback(async () => {
    if (!xcus) return;
    setLoading(true);
    try {
      const data = await customerService.getCustomerById(xcus);
      setCustomer(data);
      if (data.xstate) fetchZones(data.xstate);
      if (data.xzone) fetchAreas(data.xzone);
    } catch (error) {
      console.error("Failed to fetch customer", error);
      addToast("Failed to load customer details", "error");
    } finally {
      setLoading(false);
    }
  }, [xcus, addToast]);

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
    fetchCustomerData();
    fetchStates();
    fetchGroups();
    fetchStatuses();
  }, [fetchCustomerData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCustomer((prev) => (prev ? { ...prev, [name]: value } : null));

    if (name === "xstate") {
      setCustomer((prev) => (prev ? { ...prev, xzone: "", xarea: "" } : null));
      setZones([]);
      setAreas([]);
      fetchZones(value);
    } else if (name === "xzone") {
      setCustomer((prev) => (prev ? { ...prev, xarea: "" } : null));
      setAreas([]);
      fetchAreas(value);
    }
  };

  const handleSave = async () => {
    if (!customer || !xcus) return;
    setSaving(true);
    try {
      await customerService.updateCustomer(xcus, customer);
      addToast("Customer details updated successfully", "success");
      navigate("/customer-list");
    } catch (error) {
      console.error("Failed to update customer", error);
      addToast("Failed to update customer details", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading details...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="relative">
      <PageHeader
        title={`Edit ${customer.xcus}`}
        rightElement={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl h-9 px-4 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        }
      />

      <div className="p-4 md:p-6 mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                    Customer ID
                  </label>
                  <div className="h-9 px-3 flex items-center bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-500 font-mono text-[11px]">
                    {customer.xcus}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Customer Name
                  </label>
                  <Input
                    name="xorg"
                    value={customer.xorg}
                    onChange={handleInputChange}
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Proprietor Name
                  </label>
                  <Input
                    name="xtitle"
                    value={customer.xtitle || ""}
                    onChange={handleInputChange}
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    TRN Number
                  </label>
                  <Input
                    name="xtaxnum"
                    value={customer.xtaxnum || ""}
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
                    value={customer.xadd1 || ""}
                    onChange={handleInputChange}
                    className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      State
                    </label>
                    <Select
                      value={customer.xstate || ""}
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
                      value={customer.xzone || ""}
                      onValueChange={(v) => handleSelectChange("xzone", v)}
                      disabled={!customer.xstate}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50 transition-opacity">
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
                      value={customer.xarea || ""}
                      onValueChange={(v) => handleSelectChange("xarea", v)}
                      disabled={!customer.xzone}
                    >
                      <SelectTrigger className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50 transition-opacity">
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
                      value={customer.xzip || ""}
                      onChange={handleInputChange}
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
                      value={customer.xmobile || ""}
                      onChange={handleInputChange}
                      className="h-9 px-3 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Mobile
                    </label>
                    <Input
                      name="xfphone"
                      value={customer.xfphone || ""}
                      onChange={handleInputChange}
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
                    value={customer.xemail1 || ""}
                    onChange={handleInputChange}
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
                      value={customer.xagent || ""}
                      onChange={handleInputChange}
                      className="h-9 px-3 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Manager Phone
                    </label>
                    <Input
                      name="xphone"
                      value={customer.xphone || ""}
                      onChange={handleInputChange}
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
                      value={customer.xstatuscus || ""}
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
      </div>
    </div>
  );
}
