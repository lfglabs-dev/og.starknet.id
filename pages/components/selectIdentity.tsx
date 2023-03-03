import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { hexToDecimal } from "../../utils/utils";

type SelectIdentityProps = {
  tokenId: number;
  changeTokenId: (value: number) => void;
  defaultText?: string;
};

const SelectIdentity: FunctionComponent<SelectIdentityProps> = ({
  tokenId,
  changeTokenId,
  defaultText = "Mint a new starknet.id",
}) => {
  const { account } = useAccount();
  const [ownedIdentities, setOwnedIdentities] = useState<number[] | []>([]);
  const isTablet = useMediaQuery("(max-width:1024px)");

  useEffect(() => {
    if (account) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_APP_LINK
        }/api/indexer/addr_to_available_ids?addr=${hexToDecimal(
          account.address
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          const dataFiltered = data.ids.filter(
            (element: string, index: number) => {
              return data.ids.indexOf(element) === index;
            }
          );
          setOwnedIdentities(dataFiltered);
        });
    }
  }, [account]);

  return (
    <FormControl fullWidth>
      <InputLabel>Starknet.id</InputLabel>
      <Select
        value={tokenId}
        defaultValue={ownedIdentities[0]}
        label="Starknet.id"
        onChange={(e) => changeTokenId(Number(e.target.value))}
        sx={{
          "& .MuiSelect-select": {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <MenuItem value={0}>
          <ListItemIcon>
            <img
              width={"25px"}
              src="/starknetIdLogo.svg"
              alt="starknet.id avatar"
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              ".css-10hburv-MuiTypography-root": {
                fontSize: isTablet ? "0.8rem" : "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
            primary={defaultText}
          />
        </MenuItem>
        {ownedIdentities.map((tokenId: number, index: number) => (
          <MenuItem key={index} value={tokenId}>
            <ListItemIcon>
              <img
                width={"25px"}
                src={`https://www.starknet.id/api/identicons/${tokenId}`}
                alt="starknet.id avatar"
              />
            </ListItemIcon>
            <ListItemText primary={tokenId} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        Choose the starknet ID you want to link with your domain
      </FormHelperText>
    </FormControl>
  );
};

export default SelectIdentity;
