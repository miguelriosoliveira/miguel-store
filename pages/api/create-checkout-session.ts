import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { productId } = JSON.parse(req.body);

    const product = await stripe.products.retrieve(productId);

    const { data: prices } = await stripe.prices.list();

    const productWithPrices = {
      ...product,
      prices: prices.filter((price) => price.product === product.id),
    };

    // Process a POST request
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          currency: productWithPrices.prices[0].currency,
          name: productWithPrices.name,
          amount: productWithPrices.prices[0].unit_amount,
          description: productWithPrices.description,
          images: productWithPrices.images,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/success?itemName=${productWithPrices.name}`,
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({ id: session.id });
  } else {
    // Handle any other HTTP method
    res.status(200).json({ name: "John Not Post" });
  }
};
