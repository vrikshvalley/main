import AdminGate from "@/components/admin/AdminGate";
import OrderDetail from "@/components/admin/OrderDetail";

export default async function AdminOrderPage({ params }) {
  const { orderId } = await params;
  return (
    <AdminGate>
      <OrderDetail orderId={decodeURIComponent(orderId)} />
    </AdminGate>
  );
}
