import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "../api";
import { generateHmacAuthorizationHeader } from "../utils/hmac";
import axios from "axios";
import Stripe from "stripe";
import { Chance } from "chance";

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface Props {
  product: Stripe.Product;
}

const CheckoutButton: React.FC<Props> = ({ product }) => {
  // async function handleClick() {
  //   const stripe = await stripePromise;

  //   const response = await fetch("/api/create-checkout-session", {
  //     method: "POST",
  //     body: JSON.stringify({ productId }),
  //   });

  //   const session = await response.json();

  //   // When the customer clicks on the button, redirect them to Checkout.
  //   const result = await stripe.redirectToCheckout({
  //     sessionId: session.id,
  //   });

  //   if (result.error) {
  //     console.log({ error: result.error });
  //   }
  // }

  async function handleClick() {
    const { data: session } = await axios.post("/api/create-checkout-session", {
      productId: product.id,
    });

    const orderId = session.id;
    const Authorization = generateHmacAuthorizationHeader(orderId);

    const chance = Chance();
    const email = chance.email();

    const { data: response } = await api.post(
      "orders",
      {
        // callback: { url: "https://mysite.com/v/test" },
        // notifications: { email: true, sms: true },
        order: {
          id: orderId,
          customer: {
            id: email,
            email: email,
            first_name: chance.first(),
            last_name: chance.last(),
            phone: chance.phone(),
            address1: chance.address(),
            address2: "",
            city: chance.city(),
            country: chance.country(),
            postcode: chance.postcode(),
          },
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
  }

  return (
    <button role="link" onClick={handleClick}>
      Buy
    </button>
  );
};

export default CheckoutButton;
