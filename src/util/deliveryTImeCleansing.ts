import { deliveryStatus } from '..';

export const deliveryTime = (status: string): string | undefined => {
  const tageRegex = status.match(/tag/gi);
  const weekRegex = status.match(/woche/gi);
  const inStockRegex = status.match(/InStock/gi);
  const BackOrder = status.match(/BackOrder/gi);
  const LimitedAvailability = status.match(/LimitedAvailability/gi);
  const InStoreOnly = status.match(/InStoreOnly/gi);
  const Reserved = status.match(/Reserved/gi);
  const Discontinued = status.match(/Discontinued/gi);
  const outOfStockRegex = status.match(/OutOfStock/gi);
  const soldOutRegex = status.match(/SoldOut/gi);
  const numberRegex = status.match(/\b[0-9]{1}\b|\b[0-9]{2}\b/g);
  const sofortRegex = status.match(/sofort/gi);
  const nichtRegex = status.match(/nicht/gi);
  const vefuegbarRegex = status.match(/verfügbar/gi);
  const lagerRegex = status.match(/lager/gi);
  const eingeschraenktRegex = status.match(/eingeschränkt/gi);
  const zeitnahRegex = status.match(/zeitnah/gi);
  const zweivierhRegex = status.match(/24h/gi);
  const lieferbarRegex = status.match(/lieferbar/gi);
  const ausverkauft = status.match(/ausverkauft/gi);
  const einigen = status.match(/einigen/gi);

  if (Reserved || Discontinued || InStoreOnly || LimitedAvailability) {
    return String(deliveryStatus.l2);
  }

  if(BackOrder) {
    return String(deliveryStatus.l1);
  }

  if (outOfStockRegex || soldOutRegex) {
    return String(deliveryStatus.l2);
  }
  if (inStockRegex) {
    return String(deliveryStatus.l0);
  }
  if (ausverkauft) {
    return String(deliveryStatus.l2);
  }
  if (einigen) {
    return String(deliveryStatus.l2);
  }
  if (nichtRegex) {
    return String(deliveryStatus.l2);
  }
  if (eingeschraenktRegex) {
    return String(deliveryStatus.l1);
  }
  if (!numberRegex && sofortRegex) {
    return String(deliveryStatus.l0);
  }
  if (zweivierhRegex) {
    return String(deliveryStatus.l0);
  }
  if (numberRegex === null && vefuegbarRegex) {
    return String(deliveryStatus.l0);
  }
  if (lieferbarRegex) {
    return String(deliveryStatus.l0);
  }
  if (lagerRegex) {
    return String(deliveryStatus.l0);
  }
  if (numberRegex && (tageRegex || weekRegex) && !zweivierhRegex) {
    const nArr = numberRegex.map((el) => Number(el));
    if (nArr.length >= 2 && tageRegex) {
      return `in ${nArr[0]}-${nArr[1]} Tagen lieferbar`;
    }
    if (nArr.length >= 2 && weekRegex) {
      return `in ${nArr[0]}-${nArr[1]} Wochen lieferbar`;
    }
    if (nArr.length === 1) {
      return `in ${nArr[0]} Tagen lieferbar`;
    }
    return '';
  }
  if (zeitnahRegex && !numberRegex) {
    return 'in 1-3 Tagen lieferbar';
  }
};
