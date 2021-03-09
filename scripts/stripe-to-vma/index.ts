/**
 * 1. Get all products from Stripe
 * 2. Add them to VMA API
 */

import Stripe from "stripe";
import axios from "axios";
import { load } from "ts-dotenv";
import { generateHmacAuthorizationHeader } from "../../utils/hmac";

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

  const firstProductId = products[0].id;
  const Authorization = generateHmacAuthorizationHeader(firstProductId);

  return axios.post(
    `${VMA_API_ADDRESS}/products`,
    { products: vmaProducts },
    { headers: { Authorization } }
  );
}

async function main() {
  const products = await getProductsFromStripe();
  await addProductsToVma(products);

  console.log("DONE!");
}

main();
