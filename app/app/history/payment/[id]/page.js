import { UserPayment } from "@/components/component/user-payment";

export default async function PaymentDetails({ params }) {
    const id = params?.id || null;
    if(!id || id === null ) return <>Loading</>;
    return <UserPayment id={id} />;
}
