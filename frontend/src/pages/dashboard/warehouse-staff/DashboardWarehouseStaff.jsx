import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboardService";
import Stat from "@/components/dashboard/Stat";
import PageContainer from "@/components/backoffice/PageContainer";
import PageHeader from "@/components/backoffice/PageHeader";
import { Package, AlertTriangle } from "lucide-react";

export default function DashboardWarehouseStaff() {

  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard().then(res => {
      setData(res.data.data);
    });
  }, []);

  if (!data) return null;

  return (
    <PageContainer className="space-y-5">

      <PageHeader
        title="Tổng quan"
        description="Thông tin hoạt động kho trong ngày"
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Stat
          icon={<Package className="h-5 w-5 text-bo-primary" />}
          label="Đơn bán hôm nay"
          value={data.totalOrdersToday}
        />

        <Stat
          icon={<AlertTriangle className="h-5 w-5 text-bo-danger" />}
          label="Tồn kho thấp"
          value={data.lowStockCount}
        />

      </section>

    </PageContainer>
  );
}
