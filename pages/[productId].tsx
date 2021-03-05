import Link from "next/link";
import React from "react";
import Stripe from "stripe";
import { GetStaticPaths, GetStaticProps } from "next";

import CheckoutButton from "../components/CheckoutButton";

interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
}

interface Props {
  product: ProductWithPrices;
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const getStaticPaths: GetStaticPaths = async () => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-03-02",
  });

  const { data: products } = await stripe.products.list();

  const paths = products.map((product) => ({
    params: {
      productId: product.id,
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-03-02",
  });

  const { productId } = params;

  const product = await stripe.products.retrieve(productId as string);

  const { data: prices } = await stripe.prices.list();

  const productWithPrices = {
    ...product,
    prices: prices.filter((price) => price.product === product.id),
  };

  return {
    props: {
      product: productWithPrices,
    },
  };
};

const Product: React.FC<Props> = ({ product }) => {
  return (
    <div>
      <h1>{product.name}</h1>

      {product.images.map((image) => (
        <img src={image} style={{ width: "100px" }} />
      ))}

      {product.prices.map((price) => (
        <h2>
          {Number(price.unit_amount / 100).toFixed(2)}{" "}
          {price.currency.toUpperCase()}
        </h2>
      ))}

      <CheckoutButton productId={product.id} />

      <br />
      <br />

      <Link href="/">Go back</Link>
    </div>
  );
};

export default Product;
