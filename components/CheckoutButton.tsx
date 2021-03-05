import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface Props {
  productId: string;
}

interface BodyProps {
  productId: string;
}

const CheckoutButton: React.FC<Props> = ({ productId }) => {
  async function handleClick() {
    const stripe = await stripePromise;

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });

    const session = await response.json();

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log({ error: result.error });
    }
  }
  return (
    <button role="link" onClick={handleClick}>
      Buy
    </button>
  );
};

export default CheckoutButton;
