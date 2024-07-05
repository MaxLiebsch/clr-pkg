# DipMaxTech Arbitrage Package

Prepare relese
TODO:

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

<!-- - [ ] copy ean spotter to ean in crawldata -->
- [ ] reset ean_prop fressnapf
- [ ] reset ean_locked, ean_taskId in all dbs
- [ ] reset info_prop where costs exists and a_prc === 0 in all dbs

