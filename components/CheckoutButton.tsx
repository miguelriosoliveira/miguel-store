import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "../api";
import { generateHmacAuthorizationHeader } from "../utils/hmac";
import axios from "axios";
import Stripe from "stripe";
import { randomCustomer } from "../utils/randomCustomer";

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface Props {
  product: Stripe.Product;
}

const CheckoutButton: React.FC<Props> = ({ product }) => {
  async function redirectToCheckout(sessionId: string) {
    const stripe = await stripePromise;
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.log({ error: result.error });
    }
  }

  async function handleClick() {
    const { data: session } = await axios.post("/api/create-checkout-session", {
      productId: product.id,
    });

    const orderId = session.id;
    const Authorization = generateHmacAuthorizationHeader(orderId);

    const { data: response } = await api.post(
      "orders",
      {
        callback: { url: window.location.origin + "/api/mycallback" },
        // notifications: { email: true, sms: true },
        order: {
          id: orderId,
          customer: randomCustomer(),
          products: [
            {
              id: product.id,
              title: product.name,
              image: product.images[0],
            },
          ],
        },
      },
      { headers: { Authorization } }
    );

    console.log({ response });

    // await redirectToCheckout(session.id);
  }

  return (
    <button role="link" onClick={handleClick}>
      Buy
    </button>
  );
};

export default CheckoutButton;
