import { Chance } from "chance";

export function randomCustomer() {
  const chance = Chance();
  const email = `miguel+${Date.now()}@verifymyage.co.uk`;

  return {
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
  };
}
