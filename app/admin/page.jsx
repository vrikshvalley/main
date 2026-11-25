import AdminGate from "@/components/admin/AdminGate";
import OrdersList from "@/components/admin/OrdersList";

export default function AdminHome() {
  return (
    <AdminGate>
      <OrdersList />
    </AdminGate>
  );
}
