import gql from "graphql-tag";

export const UPDATE_RESTAURANT = gql`
  mutation UpdateRestaurant(
    $id: ID!
    $name: String
    $description: String
    $image: S3ObjectInput
    $operatingHours: OperatingHoursInput
  ) {
    updateRestaurant(
      input: {
        id: $id
        name: $name
        description: $description
        image: $image
        operatingHours: $operatingHours
      }
    ) {
      id
      name
    }
  }
`;

export const CREATE_REGISTER = gql`
  mutation CreateRegister(
    $active: Boolean!
    $name: String!
    $enableTableFlags: Boolean!
    $enablePayLater: Boolean!
    $type: RegisterType!
    $eftposProvider: EftposProvider!
    $eftposIpAddress: String
    $eftposPortNumber: String
    $orderNumberSuffix: String
    $registerRestaurantId: ID!
    $owner: ID
  ) {
    createRegister(
      input: {
        active: $active
        name: $name
        enableTableFlags: $enableTableFlags
        enablePayLater: $enablePayLater
        type: $type
        eftposProvider: $eftposProvider
        eftposIpAddress: $eftposIpAddress
        eftposPortNumber: $eftposPortNumber
        orderNumberSuffix: $orderNumberSuffix
        registerRestaurantId: $registerRestaurantId
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_REGISTER = gql`
  mutation UpdateRegister(
    $id: ID!
    $name: String!
    $enableTableFlags: Boolean!
    $enablePayLater: Boolean!
    $type: RegisterType!
    $eftposProvider: EftposProvider!
    $eftposIpAddress: String
    $eftposPortNumber: String
    $orderNumberSuffix: String
  ) {
    updateRegister(
      input: {
        id: $id
        name: $name
        enableTableFlags: $enableTableFlags
        enablePayLater: $enablePayLater
        type: $type
        eftposProvider: $eftposProvider
        eftposIpAddress: $eftposIpAddress
        eftposPortNumber: $eftposPortNumber
        orderNumberSuffix: $orderNumberSuffix
      }
    ) {
      id
    }
  }
`;

export const DELETE_REGISTER = gql`
  mutation DeleteRegister($id: ID!) {
    deleteRegister(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_REGISTER_PRINTER = gql`
  mutation CreateRegisterPrinter(
    $name: String!
    $address: String!
    $registerPrinterRegisterId: ID!
    $owner: ID
  ) {
    createRegisterPrinter(
      input: {
        name: $name
        address: $address
        registerPrinterRegisterId: $registerPrinterRegisterId
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_REGISTER_PRINTER = gql`
  mutation UpdateRegisterPrinter(
    $id: ID!
    $name: String!
    $address: String!
  ) {
    updateRegisterPrinter(
      input: {
        id: $id
        name: $name
        address: $address
      }
    ) {
      id
    }
  }
`;

export const DELETE_REGISTER_PRINTER = gql`
  mutation DeleteRegisterPrinter($id: ID!) {
    deleteRegisterPrinter(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_REGISTER_PRINTER_PRODUCT_LINK = gql`
  mutation CreateRegisterPrinterProductLink(
    $registerPrinterProductLinkRegisterPrinterId: ID!
    $registerPrinterProductLinkProductId: ID!
    $owner: ID
  ) {
    createRegisterPrinterProductLink(
      input: {
        registerPrinterProductLinkRegisterPrinterId: $registerPrinterProductLinkRegisterPrinterId
        registerPrinterProductLinkProductId: $registerPrinterProductLinkProductId
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const DELETE_REGISTER_PRINTER_PRODUCT_LINK = gql`
  mutation DeleteRegisterPrinterProductLink($id: ID!) {
    deleteRegisterPrinterProductLink(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $categoryRestaurantId: ID!
    $name: String!
    $displaySequence: Int!
    $image: S3ObjectInput
    $owner: ID
  ) {
    createCategory(
      input: {
        name: $name
        categoryRestaurantId: $categoryRestaurantId
        displaySequence: $displaySequence
        image: $image
        owner: $owner
      }
    ) {
      id
      name
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String!, $image: S3ObjectInput) {
    updateCategory(input: { id: $id, name: $name, image: $image }) {
      id
      name
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(input: { id: $id }) {
      id
      name
    }
  }
`;

export const CREATE_CATEGORY_PRODUCT_LINK = gql`
  mutation CreateCategoryProductLink(
    $categoryProductLinkCategoryId: ID!
    $categoryProductLinkProductId: ID!
    $displaySequence: Int!
    $owner: ID
  ) {
    createCategoryProductLink(
      input: {
        categoryProductLinkCategoryId: $categoryProductLinkCategoryId
        categoryProductLinkProductId: $categoryProductLinkProductId
        displaySequence: $displaySequence
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const DELETE_CATEGORY_PRODUCT_LINK = gql`
  mutation DeleteCategoryProductLink($id: ID!) {
    deleteCategoryProductLink(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String
    $image: S3ObjectInput
    $price: Int!
    $productRestaurantId: ID!
    $owner: ID
  ) {
    createProduct(
      input: {
        name: $name
        description: $description
        image: $image
        price: $price
        productRestaurantId: $productRestaurantId
        owner: $owner
      }
    ) {
      id
      description
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String!
    $description: String
    $price: Int!
    $image: S3ObjectInput
  ) {
    updateProduct(
      input: {
        id: $id
        name: $name
        description: $description
        price: $price
        image: $image
      }
    ) {
      id
      name
      description
      price
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(input: { id: $id }) {
      id
      name
    }
  }
`;

export const CREATE_PRODUCT_MODIFIER_GROUP_LINK = gql`
  mutation CreateProductModifierGroupLink(
    $productModifierGroupProductId: ID!
    $productModifierGroupModifierGroupId: ID!
    $displaySequence: Int!
    $hideForCustomer: Boolean!
    $owner: ID
  ) {
    createProductModifierGroupLink(
      input: {
        productModifierGroupLinkProductId: $productModifierGroupProductId
        productModifierGroupLinkModifierGroupId: $productModifierGroupModifierGroupId
        displaySequence: $displaySequence
        hideForCustomer: $hideForCustomer
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_PRODUCT_MODIFIER_GROUP_LINK = gql`
  mutation updateProductModifierGroupLink(
    $id: ID!
    $hideForCustomer: Boolean!
  ) {
    updateProductModifierGroupLink(
      input: { id: $id, hideForCustomer: $hideForCustomer }
    ) {
      id
    }
  }
`;

export const DELETE_PRODUCT_MODIFIER_GROUP_LINK = gql`
  mutation DeleteProductModifierGroupLink($id: ID!) {
    deleteProductModifierGroupLink(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_MODIFIER_GROUP = gql`
  mutation CreateModifierGroup(
    $name: String!
    $choiceDuplicate: Int!
    $choiceMin: Int!
    $choiceMax: Int!
    $modifierGroupRestaurantId: ID!
    $owner: ID
  ) {
    createModifierGroup(
      input: {
        name: $name
        choiceDuplicate: $choiceDuplicate
        choiceMin: $choiceMin
        choiceMax: $choiceMax
        modifierGroupRestaurantId: $modifierGroupRestaurantId
        owner: $owner
      }
    ) {
      id
      name
      choiceDuplicate
      choiceMin
      choiceMax
    }
  }
`;

export const UPDATE_MODIFIER_GROUP = gql`
  mutation UpdateModifierGroup(
    $id: ID!
    $name: String!
    $choiceDuplicate: Int!
    $choiceMin: Int!
    $choiceMax: Int!
  ) {
    updateModifierGroup(
      input: {
        id: $id
        name: $name
        choiceDuplicate: $choiceDuplicate
        choiceMin: $choiceMin
        choiceMax: $choiceMax
      }
    ) {
      id
      name
      choiceDuplicate
      choiceMin
      choiceMax
    }
  }
`;

export const DELETE_MODIFIER_GROUP = gql`
  mutation DeleteModifierGroup($id: ID!) {
    deleteModifierGroup(input: { id: $id }) {
      id
      name
      choiceDuplicate
      choiceMin
      choiceMax
    }
  }
`;

export const CREATE_MODIFIER_GROUP_MODIFIER_LINK = gql`
  mutation CreateModifierGroupModifierLink(
    $modifierGroupModifierLinkModifierGroupId: ID!
    $modifierGroupModifierLinkModifierId: ID!
    $displaySequence: Int!
    $preSelectedQuantity: Int!
    $owner: ID
  ) {
    createModifierGroupModifierLink(
      input: {
        modifierGroupModifierLinkModifierGroupId: $modifierGroupModifierLinkModifierGroupId
        modifierGroupModifierLinkModifierId: $modifierGroupModifierLinkModifierId
        displaySequence: $displaySequence
        preSelectedQuantity: $preSelectedQuantity
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_MODIFIER_GROUP_MODIFIER_LINK = gql`
  mutation UpdateModifierGroupModifierLink(
    $id: ID!
    $preSelectedQuantity: Int
  ) {
    updateModifierGroupModifierLink(
      input: { id: $id, preSelectedQuantity: $preSelectedQuantity }
    ) {
      id
    }
  }
`;

export const DELETE_MODIFIER_GROUP_MODIFIER_LINK = gql`
  mutation DeleteModifierGroupModifierLink($id: ID!) {
    deleteModifierGroupModifierLink(input: { id: $id }) {
      id
    }
  }
`;

export const CREATE_MODIFIER = gql`
  mutation CreateModifier(
    $name: String!
    $price: Int!
    $modifierRestaurantId: ID!
    $owner: ID
  ) {
    createModifier(
      input: {
        name: $name
        price: $price
        modifierRestaurantId: $modifierRestaurantId
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_MODIFIER = gql`
  mutation UpdateModifier($id: ID!, $name: String, $price: Int) {
    updateModifier(input: { id: $id, name: $name, price: $price }) {
      id
      name
    }
  }
`;

export const DELETE_MODIFIER = gql`
  mutation DeleteModifier($id: ID!) {
    deleteModifier(input: { id: $id }) {
      id
    }
  }
`;

export const UPDATE_CATEGORY_DISPLAY_SEQUENCE = gql`
  mutation UpdateCategoryDisplaySequence($id: ID!, $displaySequence: Int!) {
    updateCategory(input: { id: $id, displaySequence: $displaySequence }) {
      id
    }
  }
`;

export const UPDATE_CATEGORY_PRODUCT_LINK_DISPLAY_SEQUENCE = gql`
  mutation UpdateCategoryProductLinkDisplaySequence(
    $id: ID!
    $displaySequence: Int!
  ) {
    updateCategoryProductLink(
      input: { id: $id, displaySequence: $displaySequence }
    ) {
      id
    }
  }
`;

export const UPDATE_PRODUCT_MODIFIER_GROUP_LINK_DISPLAY_SEQUENCE = gql`
  mutation UpdateProductModifierGroupLinkDisplaySequence(
    $id: ID!
    $displaySequence: Int!
  ) {
    updateProductModifierGroupLink(
      input: { id: $id, displaySequence: $displaySequence }
    ) {
      id
    }
  }
`;

export const UPDATE_MODIFIER_GROUP_MODIFIER_LINK_DISPLAY_SEQUENCE = gql`
  mutation UpdateModifierGroupModifierLinkDisplaySequence(
    $id: ID!
    $displaySequence: Int!
  ) {
    updateModifierGroupModifierLink(
      input: { id: $id, displaySequence: $displaySequence }
    ) {
      id
      displaySequence
    }
  }
`;

export const CREATE_ADVERTISEMENT = gql`
  mutation CreateAdvertisement(
    $name: String!
    $content: S3ObjectInput!
    $advertisementRestaurantId: ID!
    $owner: ID
  ) {
    createAdvertisement(
      input: {
        name: $name
        content: $content
        advertisementRestaurantId: $advertisementRestaurantId
        owner: $owner
      }
    ) {
      id
    }
  }
`;

export const UPDATE_ADVERTISEMENT = gql`
  mutation UpdateAdvertisement(
    $id: ID!
    $name: String!
    $content: S3ObjectInput!
  ) {
    updateAdvertisement(input: { id: $id, name: $name, content: $content }) {
      id
      name
    }
  }
`;

export const DELETE_ADVERTISEMENT = gql`
  mutation DeleteAdvertisement($id: ID!) {
    deleteAdvertisement(input: { id: $id }) {
      id
      name
    }
  }
`;
