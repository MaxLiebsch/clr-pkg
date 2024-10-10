# DipMaxTech Arbitrage Package

Prepare relese

- [x] update shops on live
- [x] rename tasks from LOOKUP_EAN to CRAWL_EAN(per proxyType) in the task colletion
- [x] create new task LOOKUP_INFO
- [x] rename tasks from LOOKUP_PRODUCTS to CRAWL_AZN_LISTINGS
- [x] update active shops again
- [x] add browserConcurrency to task lookup_info
- [ ] remove errored from tasks
- [x] prevent tasks (match, crawl eans, lookup info, query eans on eby) start if no pending products
- [x] navigation timeout try twice and then leave it for later
- [ ] availability in crawl ean instock

- [ ] enter buyPrice + 10 % into input field on sellerinfo

- [x] set ebyUpdatedAt to updatedAt in crawl-data db
- [x] set aznUpdatedAt to aznUpdatedAt in crawl-data db 
- [x] set esin in crawldata, spotter db, set eby_prop = 'complete', (a_pblsh e_pblsh false in spotter cyberport)
- [x] delete match tasks for all besides cyberport
- [x] create lookup_category task
- [x] create query eans on eby task
- [x] create eby listings task for all shops
- [x] update shops on live

- [x] Add costs incl. mltr (multiplication coeffient) to asin table
- [x] detect Package in crawl
- [x] detect Package in query eans on eby
- [x] detect Package in lookup info
- [x] Save only valid eBay category in product


- [ ] Reset lookup category from before the 6.07, 12:30
- [x] Calculate eBay categories
- [x] extend all azn tasks concurrency , browserconcurrency