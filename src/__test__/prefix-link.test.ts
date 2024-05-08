import { prefixLink } from "../util/compare_helper";
import { describe, expect, test } from '@jest/globals';

describe('prefixLink.ts', () => {
    test('clean up html', () => {
        expect(
          prefixLink("https://amazon.de/BLANCO-herausziehbarem-Brausestrahl-Wasserqualit%C3%A4t-Wassersparend/dp/B07B6LMM2Q/ref=sr_1_1?dib=eyJ2IjoiMSJ9.yfwxmNd7COLMynkVQcLVNIW-3PQ-OShzOkOfJCB3TTKcGyVvmx2jtmNk6bKWQJs1FapW2BZYNbGczRCjKbEsWyExf6OyaIRiTukU6_7CDlOF5Oy8FgCQFoIqGz3akhcgMR2zzXWDiUH7-Pul1_0JOTeTWdkXAZJ1VKEAtGhpt1GXvuBUwRmr2nZ56isV-T7FBXgS5P5EBUd_cIIk269B-XVuMFGUyn6EcHAaarCj31EfZigGBSjifPuQ1wwZiXYxQB7YKyk5SH7lq-MKj90yr-xN7smrdeZ36D2E0zA0hlY.ICWCSgLVUFLlDjjZHSn8ONFWDk4J3xvOqzcj1e3Jiaw&dib_tag=se&keywords=Blanco+Ambis-S+523119&qid=1710597890&sr=8-1", "amazon.de"),
        ).toBe("https://www.amazon.de/BLANCO-herausziehbarem-Brausestrahl-Wasserqualit%C3%A4t-Wassersparend/dp/B07B6LMM2Q/ref=sr_1_1?dib=eyJ2IjoiMSJ9.yfwxmNd7COLMynkVQcLVNIW-3PQ-OShzOkOfJCB3TTKcGyVvmx2jtmNk6bKWQJs1FapW2BZYNbGczRCjKbEsWyExf6OyaIRiTukU6_7CDlOF5Oy8FgCQFoIqGz3akhcgMR2zzXWDiUH7-Pul1_0JOTeTWdkXAZJ1VKEAtGhpt1GXvuBUwRmr2nZ56isV-T7FBXgS5P5EBUd_cIIk269B-XVuMFGUyn6EcHAaarCj31EfZigGBSjifPuQ1wwZiXYxQB7YKyk5SH7lq-MKj90yr-xN7smrdeZ36D2E0zA0hlY.ICWCSgLVUFLlDjjZHSn8ONFWDk4J3xvOqzcj1e3Jiaw&dib_tag=se&keywords=Blanco+Ambis-S+523119&qid=1710597890&sr=8-1");
      });
  });