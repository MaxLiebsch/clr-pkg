import mongoose from 'mongoose';
import { Manufactuerer } from '../schemas/manufactuerer';
import { Med } from '../schemas/medication';
import {
  Candidate,
  IManufactuerer,
  IMedication,
  RelatedProducts,
} from '../types/index';
import { ObjectId } from 'mongodb';
 

export const saveMedication = async (
  candidate: Candidate,
  shopId: string,
  published = false
) => {
  try {
    //remove if exist the shopObject from the link list and returns the old document
    const { p, a, ps, n, pzn, m, l } = candidate;
    //Query parameters
    let setter: {
      m: IManufactuerer;
      n?: string;
      ps?: string;
      uvp?: number;
      otc?: boolean;
      ops?: RelatedProducts[];
      ekp?: number;
      ingr?: string[];
      syms?: string[];
    } = {
      m: { maker_id: new ObjectId(), n: '' },
    };
    const pusher: { l: string; a: string; p: string } = {
      l,
      a: '',
      p: '',
    };

    const foundMedication = await Med.findOneAndUpdate(
      { pzn: pzn },
      { $pull: { ls: { shopId: shopId } } }
    );
    //if Medication does exist
    if (foundMedication) {
      const shop = foundMedication.ls.find(
        (el) => el.shopId.toString() === shopId
      );
      //manufactuerer m || PackageSize ps || Name n needs an update
      if (m !== '' && foundMedication.m?.n === '') {
        const manufactuerer = await Manufactuerer.findOne({ n: m });
        if (manufactuerer) {
          setter.m.maker_id = manufactuerer._id;
          setter.m.n = manufactuerer.n;
        } else {
          const newmanufactuerer = await Manufactuerer.create({ n: m });
          setter.m.maker_id = newmanufactuerer._id;
          setter.m.n = newmanufactuerer.n;
        }
      }
      if (ps !== '' && !foundMedication?.ps) {
        setter.ps = ps;
      }
      if (n !== '' && foundMedication.n !== '') {
        setter.n = n;
      }
      if (a !== '') {
        pusher.a = a;
      } else if (shop && shop.c.a !== '') {
        pusher.a = shop.c.a;
      }
      if (p !== '') {
        pusher.p = p;
      } else if (shop && shop.c.p !== '') {
        pusher.p = shop.c.p;
      }

      await Med.findOneAndUpdate(
        { pzn: pzn },
        {
          $push: { ls: { shopId: shopId, c: pusher } },
          $set: setter,
        }
      );
    } else {
      pusher.a = a ? a : '';
      pusher.p = p ? p : '';
      const newMedication: IMedication = {
        n: n,
        pzn: pzn,
        ps: ps,
        m: { maker_id: new ObjectId(''), n: '' },
        ls: [
          {
            shopId: new ObjectId(shopId),
            c: pusher,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        slug: '',
        size: 0,
        size_uc: '',
        rating: [],
        createdAt: new Date().toISOString(),
        ratingAvg: 0,
        html: '',
        published,
        otc: false,
        ops: [],
        uvp: 0,
        ean: '',
        ekp: 0,
        syms: [],
        ingr: [],
        lp: '',
        mmi: false,
        docs: false
      };
      // if manufactuerer exists then set or update it
      if (m !== '') {
        const manufactuerer = await Manufactuerer.findOne({ n: m });
        if (manufactuerer) {
          newMedication.m.maker_id = manufactuerer._id;
          newMedication.m.n = m;
        } else {
          const newmanufactuerer = await Manufactuerer.create({ n: m });
          newMedication.m.maker_id = newmanufactuerer._id;
          newMedication.m.n = m;
        }
      }
      await Med.create(newMedication);
    }
  } catch (error) {
    console.log('sveMed', error);
  }
};
