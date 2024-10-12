interface ADDRESS_DTO {
  id?: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}
