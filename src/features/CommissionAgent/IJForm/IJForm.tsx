import { useForm } from "react-hook-form";
import { useState } from "react";
import agent from "../../../app/api/agent";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import {
  CommonCard,
  CommonTable,
  CustomDropdown,
  CustomInput,
  FormNavigator,
} from "../../../app/components/Components";

import { IJFormDto } from "./IJFormDto";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";

const PRICE_PER = [
  { label: "Bag", value: "Bag" },
  { label: "Qtl", value: "Qtl" },
];

function IJForm() {
  const {
    register,
    setValue,
    setFocus,
    reset,
    control,
  } = useForm<IJFormDto>();
  const accessId = getAccessIdOrRedirect();
  const dispatch = useAppDispatch();
  const [items,] = useState<IJFormDto[]>([]);
  const [, setIsEditMode] = useState(false);
  const [, setEditingItem] = useState<IJFormDto | null>(null);

  const columns: ColumnDef<IJFormDto>[] = [
    {
      accessorFn: (row) => row.itemname,
      id: "Item Name",
      header: "Item Name",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.bookNo,
      id: "Book No.",
      header: "Book No.",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.jForm,
      id: "J Form No.",
      header: "J Form No.",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.farmername,
      id: "Farmer Name",
      header: "Farmer Name",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.purchasername,
      id: "Purchaser Name",
      header: "Purchaser Name",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.Bag,
      id: "Bag",
      header: "Bag",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.wt,
      id: "Weight",
      header: "Weight",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.extra,
      id: "Extra",
      header: "Extra",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.finalBag,
      id: "Final Bag",
      header: "Final Bag",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.finalwt,
      id: "Final Weight",
      header: "Final Weight",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.rate,
      id: "Rate",
      header: "Rate",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.pricePer,
      id: "Price Per",
      header: "Price Per",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.amount,
      id: "Amount",
      header: "Amount",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.utrai,
      id: "Utrai Amount",
      header: "Utrai Amount",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.chhanai,
      id: "Chhanai Amount",
      header: "Chhanai Amount",
      cell: (info) => info.getValue() ?? "",
    },
    {
      accessorFn: (row) => row.netvalue,
      id: "Net Value",
      header: "Net Value",
      cell: (info) => info.getValue() ?? "",
    },
  ];
//   const getAllItems = async () => {
//     dispatch(setLoading(true));
//     try {
//       const fetchedItems =
//         await agent.CommissionAgentItem.getAllCommissionAgentItems(accessId);
//       setItems(fetchedItems);
//     } catch (error) {
//       toast.error("Error fetching Commission Agent Items");
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

//   useEffect(() => {
//     getAllItems();
//   }, [dispatch]);

  // const onSubmit = async (data: IJFormDto) => {
  //   dispatch(setLoading(true));
  //   const numericFields: (keyof IJFormDto)[] = [
  //       "Bag",
  //       "wt",
  //       "extra",
  //       "finalBag",
  //       "finalwt",
  //       "rate",
  //       "amount",
  //       "utrai",
  //       "chhanai",
  //     ];
  //   }
//     const processedData = convertNullOrEmptyToZero(data, numericFields);
//     try {
//       if (isEditMode && editingItem && editingItem.id !== undefined) {
//         await agent.CommissionAgentItem.updateCommissionAgentItem(
//           accessId,
//           editingItem.id,
//           processedData
//         );
//         toast.success("Commission Agent Item updated successfully");
//       } else {
//         await agent.CommissionAgentItem.createCommissionAgentItem(
//           accessId,
//           processedData
//         );
//         toast.success("Commission Agent Item added successfully");
//       }
//       reset();
//       setFocus("itemname");
//       setIsEditMode(false);
//       setEditingItem(null);
//     //   getAllItems();
//     } catch (error) {
//       handleApiErrors(error);
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };

  const handleEdit = (row: IJFormDto) => {
    setEditingItem(row);
    setIsEditMode(true);
    setValue("itemname", row.itemname);
    setValue("bookNo", row.bookNo);
    setValue("jForm", row.jForm);
    setValue("soldtogovt", row.soldtogovt );
    setValue("farmername", row.farmername);
    setValue("purchasername", row.purchasername);
    setValue("Bag", row.Bag);
    setValue("wt", row.wt);
    setValue("extra", row.extra);
    setValue("finalBag", row.finalBag);
    setValue("finalwt", row.finalwt);
    setValue("rate", row.rate);
    setValue("pricePer", row.pricePer);
    setValue("amount", row.amount);
    setValue("utrai", row.utrai);
    setValue("chhanai", row.chhanai);
    setValue("netvalue", row.netvalue);
    setFocus("itemname");
  };

  const handleDelete = async (row: IJFormDto) => {
    if (row.id === undefined) {
      toast.error("Error: Invalid Item ID");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete the item "${row.itemname}"?`
      )
    ) {
      dispatch(setLoading(true));
      try {
        await agent.CommissionAgentItem.deleteCommissionAgentItem(
          accessId,
          row.id
        );
        toast.success(`Item "${row.itemname}" deleted successfully`);
        // getAllItems();
      } catch (error) {
        toast.error("Error deleting item");
      } finally {
        reset();
        setFocus("itemname");
        setIsEditMode(false);
        setEditingItem(null);
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <CommonCard header="J-Form" size="100%">
      <FormNavigator>
        <Row>
          <Col xs={2}>
            <CustomInput
              label="Date |"
              name="date"
              type="date"
              register={register}
            />
          </Col>
          <Col xs={4}>
            <CustomInput
              label="Mandi  F3-NEW"
              name="itemName"
              register={register}
              validationRules={{
                required: "Item Name cannot be empty.",
              }}
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Book No."
              name="bookNo"
              type="number"
              register={register}
            />
          </Col>
          <Col xs={1}>
            <CustomInput label="J Form" name="jForm" register={register} />
          </Col>
          <Col xs={2}>
            <CustomDropdown
              label="Sold to Govt."
              name="soldToGovt"
              options={[
                { label: "Y", value: "Y" },
                { label: "N", value: "N" },
              ]}
              control={control}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <CustomDropdown
              label="Farmer Name [F3-New]"
              name="farmerName"
              options={[]}
              control={control}
            />
          </Col>
          <Col xs={4}>
            <CustomDropdown
              label="Purchaser Name [F3-New]"
              name="purchaserName"
              options={[]}
              control={control}
            />
          </Col>
          <Col xs={4}>
            <CustomDropdown
              label="Item Name [F3-New]"
              name="itemName"
              options={[]}
              control={control}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={1}>
            <CustomInput
              label="Bag."
              name="Bag"
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Wt."
              name="weigth"
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Extra"
              name="Extra"
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Final Bag."
              name="FinalBag."
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Final Wt."
              name="FinalWt."
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Rate"
              name="Rate"
              register={register}
              allowedChars="numericDecimal"
            />
          </Col>
          <Col xs={2}>
            <CustomDropdown
              label="Price Per"
              name="pricePer"
              options={PRICE_PER}
              control={control}
            />
          </Col>
          <Col xs={1}>
            <CustomInput label="Amount" name="amount" register={register} />
          </Col>
          <Col xs={1}>
            <CustomInput label="Utrai." name="amount" register={register} />
          </Col>
          <Col xs={1}>
            <CustomInput label="Chhanai." name="amount" register={register} />
          </Col>
          <Col xs={1}>
            <CustomInput
              label="Net Value"
              name="netValue"
              register={register}
            />
          </Col>
        </Row>
      </FormNavigator>

      <div className="mt-3">
        <CommonTable
          data={items}
          columns={columns}
          onRowClick={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </CommonCard>
  );
}

export default IJForm;
