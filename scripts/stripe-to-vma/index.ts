/**
 * 1. Get all products from Stripe
 * 2. Save on "products.json"
 */

import Stripe from "stripe";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const VMA_API_ADDRESS = process.env.VMA_API_ADDRESS;
const VMA_API_ID = process.env.VMA_API_ID;
const VMA_API_KEY = process.env.VMA_API_KEY;
const VMA_API_SECRET = process.env.VMA_API_SECRET;

async function getProductsFromStripe() {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-03-02",
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
