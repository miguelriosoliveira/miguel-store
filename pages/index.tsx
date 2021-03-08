import { GetStaticProps } from "next";
import Stripe from "stripe";
import Link from "next/link";

interface ProductWithPrices extends Stripe.Product {
  prices: Stripe.Price[];
}

interface Props {
  products: ProductWithPrices[];
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export const getStaticProps: GetStaticProps = async () => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
  });

  const { data: products } = await stripe.products.list();
  const { data: prices } = await stripe.prices.list();

  const productsWithPrices = products.map((product) => ({
    ...product,
    prices: prices.filter((price) => price.product === product.id),
  }));

  return {
    props: {
      products: productsWithPrices,
    },
  };
};

const HomePage: React.FC<Props> = ({ products }) => {
  return (
    <>
      <h1>Simple Stripe Store</h1>

      <hr />

      {products.map((product) => (
        <div key={product.id}>
          <h1>{product.name}</h1>

          {product.images.map((image) => (
            <img key={image} src={image} style={{ width: "100px" }} />
          ))}

          {product.prices.map((price) => (
            <h2 key={price.id}>
              {Number(price.unit_amount / 100).toFixed(2)}{" "}
              {price.currency.toUpperCase()}
            </h2>
          ))}

          <Link href={"/" + product.id}>Visit Page</Link>

          <hr />
        </div>
      ))}
    </>
  );
};

export default HomePage;
