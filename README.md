## Front-end Subdomain Distribution 🌴

An example of subdomain distribution front end. This front end interacts with [this contract]("https://github.com/starknet-id/subdomain-distribution") that you can use as you want.

### How to use this template ? 🌴

_First step:_ Clone this repo `git clone https://github.com/starknet-id/og.starknet.id`

_Second step:_ Install the dependencies using `npm i`

_Third step:_ Create an environnement file named `.env.local`. Here is the one we use for https://goerli.og.starknet.id. Be sure to change every variable depending on your needs. (The `NEXT_PUBLIC_ROOT_DOMAIN`represents the domain that you'll distribute on your app).

```
NEXT_PUBLIC_APP_LINK=https://goerli.app.starknet.id
NEXT_PUBLIC_STARKNETID_CONTRACT=0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d
NEXT_PUBLIC_DISTRIBUTION_CONTRACT=0x557215e9fa1b79e7aa0ea9b10cb4c06055c01cff797094eb270d7044e578ac8
NEXT_PUBLIC_ROOT_DOMAIN=vip
NEXT_PUBLIC_IS_TESTNET=true
```

_Fourth step:_ Add your UI style on `globals.css` and change the image in `index.ts` to match your branding.

```
css

  --primary: #19aa6e;
  --secondary: #402d28;
  --tertiary: #f0d7bd;
  --background: #fff9f0;
```

If you have questions concerning this deployment you can ask [Fricoben](https://twitter.com/fricoben).

### License 🌴

This project is licensed under the terms of the MIT license.
