import { OptionType } from "../models/optionType";
import agent from "../api/agent"; // Assuming this is where your API calls are defined
import { formatDateForBackend } from "./dateUtils";
import toast from "react-hot-toast";
import { ItemDropDownListDto } from "../../features/Masters/Item/ItemDto";

const transformVoucherItemToOption = (item: ItemDropDownListDto): OptionType => {
  const labelParts = [
    `${item.itemName}`.padEnd(30, " "),
    item.openingStock ? `Op. Stock: ${item.openingStock}` : "",
    item.netPurQty ? `Purchases: ${item.netPurQty}` : "",
    item.netSaleQty ? `Sales: ${item.netSaleQty}` : "",
    item.balance ? `Balance: ${item.balance}` : "",
    item.gstSlabName ? `GSTSlab: ${item.gstSlabName}` : "",
  ].filter((part) => part !== ""); // Remove empty parts

  return {
    value: item.itemId,
    label: labelParts.join(" | "),
  };
};

// Fetch and transform function
export const fetchVoucherItemListForDropdown = async (
  accessId: string,
  selectedTaxType: string,
  financialYearFrom: string | Date,
  currentVoucherDate: Date | string
): Promise<OptionType[]> => {
  try {
    const itemList: ItemDropDownListDto[] =
      await agent.Item.getVoucherItemsForDropDownList(
        accessId,
        selectedTaxType,
        financialYearFrom.toString(),
        formatDateForBackend(currentVoucherDate)
      );
    return itemList.map(transformVoucherItemToOption);
  } catch (error) {
    toast.error("Failed to load items.");
    return [];
  }
};
