/**
 * 1. Get all products from Stripe
 * 2. Add them to VMA API
 */

import Stripe from "stripe";
import axios from "axios";
import crypto from "crypto";
import { load } from "ts-dotenv";

const env = load(
  {
    STRIPE_SECRET_KEY: String,
    VMA_API_ADDRESS: String,
    VMA_API_ID: String,
    VMA_API_KEY: String,
    VMA_API_SECRET: String,
  },
  ".env.local"
);

const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
const VMA_API_ADDRESS = env.VMA_API_ADDRESS;
const VMA_API_ID = env.VMA_API_ID;
const VMA_API_KEY = env.VMA_API_KEY;
const VMA_API_SECRET = env.VMA_API_SECRET;

async function getProductsFromStripe() {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  });
  const { data: products } = await stripe.products.list();
  return products;
}

interface StripeProduct {
  id: string;
  name: string;
  images: string[];
}

interface VmaProduct {
  id: string;
  title: string;
  image: string;
  age_restricted: boolean;
}

async function addProductsToVma(products: StripeProduct[]) {
  const ageRestrictedProductIds = [
    "prod_J4YCJCn1Y7z7GK",
    "prod_J4YA30rbva92b2",
  ];

  const vmaProducts: VmaProduct[] = products.map((product) => {
    const isAgeRestricted = ageRestrictedProductIds.some(
      (ageRestrictedProductId) => product.id === ageRestrictedProductId
    );
    return {
      id: product.id,
      title: product.name,
      image: product.images[0],
      age_restricted: isAgeRestricted,
    };
  });

  const unixTimestamp = Date.now() / 1000; // in seconds
  const firstProductId = products[0].id;
  const hmac = crypto
    .createHmac("sha256", VMA_API_SECRET)
    .update(`${VMA_API_KEY}${unixTimestamp}${firstProductId}`)
    .digest("hex");

  return axios.post(
    `${VMA_API_ADDRESS}/products`,
    { products: vmaProducts },
    {
      headers: {
        Authorization: `hmac ${VMA_API_ID}:${unixTimestamp}:${hmac}`,
      },
    }
  );
}

async function main() {
  const products = await getProductsFromStripe();
  await addProductsToVma(products);

  console.log("DONE!");
}

main();
