const CARS = [
  { id: 100, createdAt:Date.now(), adType: 3,ownerType: "salon",ownerId: 1, country: "AZ", city: "Bakı", brand: "Lada", model: "Niva", year: 2024, price: 98000, mileage: 9000, fuel: "Benzin", gearbox: "Mexanika", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Modificated_Lada_Niva_in_Azerbaijan%2C_Baku.jpg", link: "details.html?id=102", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2F0c9b681d-24b9-4476-960e-a2226cad39c5%2F80452_EGOsmiA8G_4kxLGHsgHXJQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F54%2F7c8372eb-628d-47c3-b48b-d95d900f4981%2F80838_w4zq7N_YAq4CNKQrly3rnA.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2Fef533cf5-f4d8-46a0-9fec-6f68f950b52e%2F80393_qM4_Id_jBOzfvRP55YRJwg.jpg"] },
  { id: 101, createdAt:Date.now(), adType: 2, country: "AZ",ownerType: "user",ownerId: 1001,sellerName: "Həsən İmanov",sellerPhone: "+994555991313", sellerSince: "03.2024", hidePhone: true, city: "Bakı", brand: "Mercedes", model: "C250", year: 2012, price: 23500, mileage: 168000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2Faa6970e9-c954-49b4-932d-9dd4eb778dc0%2F60140_lFROYH38cQAxab9A2ROerQ.jpg", link: "details.html?id=101", images:["https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F43%2F1a6fa666-d47b-4405-bc1f-1a397e287636%2F89094_cS0jJRwrZQp7K9eI5kwxkw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2F4feca2be-58ba-441e-a5c3-3bf239f6603e%2F60195_GjaQCdbi4DHxzx41iJEtZw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F47%2F997a202d-3081-4f8f-8e78-90fd6721ef4e%2F60261_dvzL6t_pXLqanakCT7UXZg.jpg"] },
  { id: 102, createdAt:Date.now(), adType: 1,ownerType: "salon",ownerId: 2, country: "AZ", city: "Bakı", brand: "Lada", model: "Niva", year: 2024, price: 98000, mileage: 9000, fuel: "Benzin", gearbox: "Mexanika", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Modificated_Lada_Niva_in_Azerbaijan%2C_Baku.jpg", link: "details.html?id=102", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2F0c9b681d-24b9-4476-960e-a2226cad39c5%2F80452_EGOsmiA8G_4kxLGHsgHXJQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F54%2F7c8372eb-628d-47c3-b48b-d95d900f4981%2F80838_w4zq7N_YAq4CNKQrly3rnA.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2Fef533cf5-f4d8-46a0-9fec-6f68f950b52e%2F80393_qM4_Id_jBOzfvRP55YRJwg.jpg"] },
  { id: 103, createdAt:Date.now(), adType: 2,ownerType: "user",ownerId: 1002,sellerName: "Qasım Məmmədov",sellerPhone: "+994513999957",  country: "AZ", city: "Gəncə", brand: "Toyota", model: "Camry", year: 2018, price: 29500, mileage: 110000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F18%2F28%2F08%2F98354ec0-7781-477a-8d86-63653cbb6fc6%2F80890_Oq4eV_GpJgIhUSVRDVECtQ.jpg", link: "details.html?id=103", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F33%2F6d01c89b-1da6-4395-b15a-1f5e2d130849%2F80432_x5NUHxHaEdjRoUdT_dc7HQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2F56bb2f54-0b79-4e23-af13-52b81d04377d%2F80432_e6auNkqmJrTT7Fm0vW_F5w.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2Fe4bb6c0c-d92c-4a27-9fec-e1a901e4887c%2F48688_Xxob7jzORO896JDY1PmYqQ.jpg"]},
  { id: 104, createdAt:Date.parse("2026-01-10T12:00:00+04:00"), adType: 1,ownerType: "user",ownerId: 1003,sellerName: "Nasib Karipoğlu",sellerPhone: "+994505381413", country: "TR", city: "İstanbul", brand: "Hyundai", model: "Elantra", year: 2016, price: 16500, mileage: 1470000, fuel: "Benzin", gearbox: "Mexanika", img: "https://turbo.azstatic.com/uploads/full/2025%2F12%2F23%2F16%2F05%2F29%2Fe64d9261-2c82-441e-a8e3-82717b8fd481%2F46971_KGjeHaANgNY5C5WMaOx-rw.jpg", link: "details.html?id=104", images:["https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F34%2F34%2Fda65dd98-369f-4121-9c8c-577ad03ef2f8%2F49137_8UVoZYQExT74YwpptagJhQ.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F35%2F15%2Fb8aaeb2d-f2bc-428a-9200-6719f1a230f4%2F98628_GpiZJqqDLjh7a0z78FWKDw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F34%2F35%2Fcffb87a1-08c8-47e3-84f0-09f2f7191fba%2F59372_57Ls4RrY7t0uug94THHsbw.jpg"] },
  { id: 105, createdAt:Date.parse("2026-01-10T12:00:00+04:00"), adType: 2,ownerType: "user",ownerId: 1004,sellerName: "Abiş Kuliyev",sellerPhone: "+994995991313", country: "AZ", city: "Sumqayıt", brand: "Kia", model: "Sportage", year: 2020, price: 33000, mileage: 72000, fuel: "Dizel", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F11%2F232e36d8-763e-41e1-9227-6684d070c708%2F47032_VIedcJ10dBL8SArtm2Pp_w.jpg", link: "details.html?id=105", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F11%2F41aaa506-f53f-4b94-b8c1-25024b7358ff%2F47132_UkmFKLlSBDLpuvqLn8SFRQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F12%2F2911627b-7b14-40ba-b937-5e4b89d495dd%2F46628_ZCP56cFxEFDpwzLepIFKuw.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F12%2Fd68e31e1-2fdd-4c36-b711-0be67f947117%2F69330_WcIcNWrePrjsrE1gLH5KlA.jpg"] },
  { id: 106, createdAt:Date.parse("2026-01-11T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 5,sellerName: "Həsən İmanov",sellerPhone: "+994555991313", country: "GE", city: "Tbilisi", brand: "Toyota", model: "Camry", year: 2012, price: 13900, mileage: 210000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2026%2F01%2F18%2F13%2F30%2F53%2F6763e8f5-9598-417c-92fb-f9e69d952dbc%2F80688_6ALHBx-Sj_lie0bwwRfaUA.jpg", link: "details.html?id=106", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F33%2F6d01c89b-1da6-4395-b15a-1f5e2d130849%2F80432_x5NUHxHaEdjRoUdT_dc7HQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2F56bb2f54-0b79-4e23-af13-52b81d04377d%2F80432_e6auNkqmJrTT7Fm0vW_F5w.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2Fe4bb6c0c-d92c-4a27-9fec-e1a901e4887c%2F48688_Xxob7jzORO896JDY1PmYqQ.jpg"] },
  { id: 107, createdAt:Date.parse("2026-01-11T12:00:00+04:00"), adType: 2,ownerType: "salon",ownerId: 5, country: "DE", city: "Berlin", brand: "Mercedes", model: "E200", year: 2015, price: 25500, mileage: 155000, fuel: "Dizel", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F08%2F14%2F30%2F08%2F0c25a8c4-46dc-499d-bf69-fc195c4b9bd8%2F40131_cs9N9jw19_BxcXbll3L2-w.jpg", link: "details.html?id=107", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F08%2F14%2F30%2F08%2F4c1a8a43-c102-4541-9ab4-21785e7649ae%2F47042_1YdUmAx2iIvuoSlr2Ay_kQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F08%2F14%2F30%2F08%2Fb4657e67-ce29-4762-8b5c-2d4438b93cad%2F67304_G33p3695a50l3MAXhGsWGw.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F08%2F14%2F30%2F08%2F3161cd14-6697-4361-afe4-1c304cb5ff41%2F95255_HLDpIcpei5mIIoFiVrWDdg.jpg"]},
  { id: 108, createdAt:Date.parse("2026-01-13T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 4, country: "AZ", city: "Bakı", brand: "Kia", model: "Rio", year: 2019, price: 17800, mileage: 89000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2025%2F04%2F05%2F00%2F50%2F22%2F70cf8846-db44-4c52-ad23-c7c6e3a039e6%2F2746_FhBLeET6_RWLOHbwaKgtUw.jpg", link: "details.html?id=108", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F17%2F19%2F32%2F03%2Fc7e66ad4-d728-4a0e-aa5c-0856d7951a99%2F47017_dosQShjmXV1_BiiySlZ8bQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F17%2F19%2F32%2F03%2F06356649-b8f1-4e0e-a24b-fc229640d595%2F46725_nuqgtME0uzCsW1n8vfCl1A.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F17%2F19%2F32%2F03%2Fdf45d390-839f-4454-83df-51c7c22e36bc%2F47086_3DxTibWQLpQLYYIXJ7D03Q.jpg"]},
  { id: 109, createdAt:Date.parse("2026-01-13T12:00:00+04:00"), adType: 3,ownerId: 1005,sellerName: "İlkin Mübarizoğlu",sellerPhone: "+994558359635", country: "TR", city: "İstanbul", brand: "BMW", model: "M3", year: 2021, price: 72000, mileage: 34000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F07%2F15%2F21%2F12%2F910bf4c9-7951-4632-a993-3419b74ac3a7%2F29952_uIs1u81mVw5b5UVAxSzhdw.jpg", link: "details.html?id=109", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F13%2F4ed1c885-f57e-45d7-995f-1e8e6aebdac5%2F89093_T3KLjSwSideHMzWSxu_0qg.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F13%2Fd63b8b34-e2ef-404d-988c-f4079a0beadb%2F22785_dxOwUlSkUhF5t_0sNDCIMQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F14%2F150d2a00-341a-451f-b1bf-ed0d5baedfd5%2F29958_CZDxHGLep44Ik_CEAoXxsA.jpg"] },
  { id: 110, createdAt:Date.parse("2026-01-13T12:00:00+04:00"), adType: 2,ownerId: 1006,sellerName: "Ülftə Arastunoğlu",sellerPhone: "+994703602383", country: "AZ", city: "Gəncə", brand: "Mercedes", model: "C250", year: 2011, price: 18900, mileage: 192000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F07%2F13%2F57%2F40%2F0cadf9e6-a19f-4dfb-b9f9-9374f4a6fa82%2F80394_V1XsCKwAYN11B8KxgUC96A.jpg", link: "details.html?id=110", images:["https://turbo.az/autos/10053737-mercedes-c-180","https://turbo.azstatic.com/uploads/full/2026%2F01%2F18%2F19%2F32%2F29%2F8e2e89f8-8255-48f2-b351-a080d165e8e9%2F99405_s00LIfztybkSVLngKtCcEQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F18%2F19%2F32%2F30%2F258f418d-d9df-42e4-ae61-405e5351e13f%2F46931_57Ld1hMMLz2MarjCOuC8Hw.jpg"] },
  { id: 111, createdAt:Date.parse("2026-01-08T12:00:00+04:00"), adType: 3,ownerId: 1007,sellerName: "Kulu Balakişi",sellerPhone: "+994556533644", country: "AZ", city: "Bakı", brand: "Toyota", model: "Camry", year: 2022, price: 44500, mileage: 35000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2025%2F11%2F09%2F15%2F36%2F58%2F70879996-b818-4bc2-bebb-004ef00a3fb9%2F4164_q6NjAn_iYobtJzTEf0S02A.jpg", link: "details.html?id=111", images:["https://turbo.azstatic.com/uploads/full/2025%2F11%2F09%2F15%2F37%2F12%2F295d595c-7edb-43ee-9199-403463d84368%2F57779_avPIXTk1UmhmIXze5SgIvw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F11%2F09%2F15%2F37%2F13%2F369ad7f0-47cb-47f2-901c-e45a6c4f869d%2F55680_P_DV5RDzZ_6c4H0flK2Oiw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F11%2F09%2F15%2F37%2F13%2F369ad7f0-47cb-47f2-901c-e45a6c4f869d%2F55680_P_DV5RDzZ_6c4H0flK2Oiw.jpg"] },
  { id: 112, createdAt:Date.parse("2026-01-08T12:00:00+04:00"), adType: 3,ownerId: 1008,sellerName: "ELvin Balakisioklu",sellerPhone: "+994772774316", country: "AZ", city: "Sumqayıt", brand: "BMW", model: "M3", year: 2018, price: 63500, mileage: 76000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F14%2F19%2F47%2F16%2Ff1e60d2c-acaf-43f7-9aa1-936d90583893%2F32503__2jkVr2paaSwA29qtOk0Vw.jpg", link: "details.html?id=112", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F47%2F16%2Fa84e8cea-c20d-4450-87d4-cee6850fc67a%2F32492_5H3ZmUrjbQxxCkA9OaV9Zg.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F47%2F16%2F6454c0aa-9fc5-44f2-81bf-8c21cb658d84%2F88995_VgNm27vygupQ0SdQrvl5LA.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F56%2F11%2F81407fb6-0142-4073-ba6f-fa44b912317c%2F80838_-r3g8DkDgMi_-0M2N9vhOg.jpg"] },
  { id: 113, createdAt:Date.parse("2026-01-07T12:00:00+04:00"), adType: 1,ownerId: 1009,sellerName: "Vahid Ağazadə",sellerPhone: "+994515605886", country: "AZ", city: "Bakı", brand: "Mercedes", model: "C250", year: 2012, price: 23500, mileage: 168000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2Faa6970e9-c954-49b4-932d-9dd4eb778dc0%2F60140_lFROYH38cQAxab9A2ROerQ.jpg", link: "details.html?id=101", images:["https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F43%2F1a6fa666-d47b-4405-bc1f-1a397e287636%2F89094_cS0jJRwrZQp7K9eI5kwxkw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2F4feca2be-58ba-441e-a5c3-3bf239f6603e%2F60195_GjaQCdbi4DHxzx41iJEtZw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F47%2F997a202d-3081-4f8f-8e78-90fd6721ef4e%2F60261_dvzL6t_pXLqanakCT7UXZg.jpg"] },
  { id: 114, createdAt:Date.parse("2026-01-06T12:00:00+04:00"), adType: 1,ownerId: 1010,sellerName: "Əli İsmayılzadə",sellerPhone: "+994517010077", country: "AZ", city: "Bakı", brand: "Lada", model: "Niva", year: 2024, price: 98000, mileage: 9000, fuel: "Benzin", gearbox: "Mexanika", img: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Modificated_Lada_Niva_in_Azerbaijan%2C_Baku.jpg", link: "details.html?id=102", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2F0c9b681d-24b9-4476-960e-a2226cad39c5%2F80452_EGOsmiA8G_4kxLGHsgHXJQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F54%2F7c8372eb-628d-47c3-b48b-d95d900f4981%2F80838_w4zq7N_YAq4CNKQrly3rnA.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F16%2F10%2F33%2F55%2Fef533cf5-f4d8-46a0-9fec-6f68f950b52e%2F80393_qM4_Id_jBOzfvRP55YRJwg.jpg"] },
  { id: 115, createdAt:Date.parse("2026-01-06T12:00:00+04:00"), adType: 1,ownerId: 1011,sellerName: "Elnur Fətəliyev",sellerPhone: "+994507613927", country: "AZ", city: "Gəncə", brand: "Toyota", model: "Camry", year: 2018, price: 29500, mileage: 110000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F18%2F28%2F08%2F98354ec0-7781-477a-8d86-63653cbb6fc6%2F80890_Oq4eV_GpJgIhUSVRDVECtQ.jpg", link: "details.html?id=103", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F33%2F6d01c89b-1da6-4395-b15a-1f5e2d130849%2F80432_x5NUHxHaEdjRoUdT_dc7HQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2F56bb2f54-0b79-4e23-af13-52b81d04377d%2F80432_e6auNkqmJrTT7Fm0vW_F5w.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F10%2F01%2F02%2F15%2Fe4bb6c0c-d92c-4a27-9fec-e1a901e4887c%2F48688_Xxob7jzORO896JDY1PmYqQ.jpg"]},
  { id: 116, createdAt:Date.parse("2026-01-05T12:00:00+04:00"), adType: 1,ownerId: 1002,sellerName: "Asəf Qasımzadə",sellerPhone: "+994705892287", country: "TR", city: "İstanbul", brand: "Hyundai", model: "Elantra", year: 2016, price: 16500, mileage: 1470000, fuel: "Benzin", gearbox: "Mexanika", img: "https://turbo.azstatic.com/uploads/full/2025%2F12%2F23%2F16%2F05%2F29%2Fe64d9261-2c82-441e-a8e3-82717b8fd481%2F46971_KGjeHaANgNY5C5WMaOx-rw.jpg", link: "details.html?id=104", images:["https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F34%2F34%2Fda65dd98-369f-4121-9c8c-577ad03ef2f8%2F49137_8UVoZYQExT74YwpptagJhQ.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F35%2F15%2Fb8aaeb2d-f2bc-428a-9200-6719f1a230f4%2F98628_GpiZJqqDLjh7a0z78FWKDw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F08%2F16%2F34%2F35%2Fcffb87a1-08c8-47e3-84f0-09f2f7191fba%2F59372_57Ls4RrY7t0uug94THHsbw.jpg"] },
  { id: 117, createdAt:Date.parse("2025-12-31T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 12, country: "AZ", city: "Sumqayıt", brand: "Kia", model: "Sportage", year: 2020, price: 33000, mileage: 72000, fuel: "Dizel", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F11%2F232e36d8-763e-41e1-9227-6684d070c708%2F47032_VIedcJ10dBL8SArtm2Pp_w.jpg", link: "details.html?id=105", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F11%2F41aaa506-f53f-4b94-b8c1-25024b7358ff%2F47132_UkmFKLlSBDLpuvqLn8SFRQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F12%2F2911627b-7b14-40ba-b937-5e4b89d495dd%2F46628_ZCP56cFxEFDpwzLepIFKuw.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F02%2F01%2F44%2F12%2Fd68e31e1-2fdd-4c36-b711-0be67f947117%2F69330_WcIcNWrePrjsrE1gLH5KlA.jpg"] },
  { id: 118, createdAt:Date.parse("2025-12-31T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 8, country: "AZ", city: "Bakı", brand: "Mercedes", model: "C250", year: 2012, price: 23500, mileage: 168000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2Faa6970e9-c954-49b4-932d-9dd4eb778dc0%2F60140_lFROYH38cQAxab9A2ROerQ.jpg", link: "details.html?id=101", images:["https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F43%2F1a6fa666-d47b-4405-bc1f-1a397e287636%2F89094_cS0jJRwrZQp7K9eI5kwxkw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F45%2F4feca2be-58ba-441e-a5c3-3bf239f6603e%2F60195_GjaQCdbi4DHxzx41iJEtZw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F12%2F02%2F14%2F14%2F47%2F997a202d-3081-4f8f-8e78-90fd6721ef4e%2F60261_dvzL6t_pXLqanakCT7UXZg.jpg"] },
  { id: 119, createdAt:Date.parse("2025-12-30T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 9, country: "AZ", city: "Bakı", brand: "Toyota", model: "Camry", year: 2022, price: 44500, mileage: 35000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2025%2F11%2F09%2F15%2F36%2F58%2F70879996-b818-4bc2-bebb-004ef00a3fb9%2F4164_q6NjAn_iYobtJzTEf0S02A.jpg", link: "details.html?id=111", images:["https://turbo.azstatic.com/uploads/full/2025%2F11%2F09%2F15%2F37%2F12%2F295d595c-7edb-43ee-9199-403463d84368%2F57779_avPIXTk1UmhmIXze5SgIvw.jpg","https://turbo.azstatic.com/uploads/full/2025%2F11%2F09%2F15%2F37%2F13%2F369ad7f0-47cb-47f2-901c-e45a6c4f869d%2F55680_P_DV5RDzZ_6c4H0flK2Oiw.jpg"] },
  { id: 120, createdAt:Date.parse("2025-12-28T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 2, country: "AZ", city: "Sumqayıt", brand: "BMW", model: "M3", year: 2018, price: 63500, mileage: 76000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F14%2F19%2F47%2F16%2Ff1e60d2c-acaf-43f7-9aa1-936d90583893%2F32503__2jkVr2paaSwA29qtOk0Vw.jpg", link: "details.html?id=112", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F47%2F16%2Fa84e8cea-c20d-4450-87d4-cee6850fc67a%2F32492_5H3ZmUrjbQxxCkA9OaV9Zg.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F47%2F16%2F6454c0aa-9fc5-44f2-81bf-8c21cb658d84%2F88995_VgNm27vygupQ0SdQrvl5LA.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F14%2F19%2F56%2F11%2F81407fb6-0142-4073-ba6f-fa44b912317c%2F80838_-r3g8DkDgMi_-0M2N9vhOg.jpg"] },
  { id: 121, createdAt:Date.parse("2025-12-28T12:00:00+04:00"), adType: 1,ownerType: "salon",ownerId: 1, country: "TR", city: "Bakı", brand: "BMW", model: "M3", year: 2021, price: 23000, mileage: 34000, fuel: "Benzin", gearbox: "Avtomat", img: "https://turbo.azstatic.com/uploads/f460x343/2026%2F01%2F07%2F15%2F21%2F12%2F910bf4c9-7951-4632-a993-3419b74ac3a7%2F29952_uIs1u81mVw5b5UVAxSzhdw.jpg", link: "details.html?id=109", images:["https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F13%2F4ed1c885-f57e-45d7-995f-1e8e6aebdac5%2F89093_T3KLjSwSideHMzWSxu_0qg.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F13%2Fd63b8b34-e2ef-404d-988c-f4079a0beadb%2F22785_dxOwUlSkUhF5t_0sNDCIMQ.jpg","https://turbo.azstatic.com/uploads/full/2026%2F01%2F07%2F15%2F21%2F14%2F150d2a00-341a-451f-b1bf-ed0d5baedfd5%2F29958_CZDxHGLep44Ik_CEAoXxsA.jpg"] },
];


window.cars = CARS;

// ✅ missing field-ləri avtomatik tamamla (Turbo.az kimi)
CARS.forEach(c => {
  if (!("color" in c))  c.color  = ["Ağ","Qara","Gümüşü","Boz","Göy","Qırmızı"][c.id % 6];
  if (!("body" in c))   c.body   = ["Sedan","SUV","Hetçbek","Krossover"][c.id % 4];
  if (!("drive" in c))  c.drive  = ["Ön","Arxa","Tam (4x4)"][c.id % 3];
  if (!("owners" in c)) c.owners = (c.id % 3) + 1;
  if (!("seats" in c))  c.seats  = [4,5,7][c.id % 3];
  if (!("market" in c)) c.market = ["Rəsmi","ABŞ","Avropa","Koreya","Yaponiya"][c.id % 5];
  if (!("status" in c)) c.status = "Satışda";
  if (!("features" in c)) c.features = ["ABS","Kondisioner","Park radarı","Arxa kamera"].slice(0, (c.id % 4) + 1);
});

const BRAND_MODELS = {
  "Mercedes-Benz": ["C 200", "C 250", "E 200", "E 300", "S 500", "GLA", "GLC", "GLE", "G-Class"],
  "BMW": ["320", "520", "530", "X3", "X5", "M3", "M5"],
  "Toyota": ["Camry", "Corolla", "Prius", "RAV4", "Land Cruiser"],
  "Hyundai": ["Elantra", "Sonata", "Santa Fe", "Tucson"],
  "Kia": ["Rio", "Cerato", "Sportage", "Sorento"]
};

const COLORS = ["Ağ", "Qara", "Gümüşü", "Boz", "Göy", "Qırmızı", "Yaşıl", "Sarı", "Bənövşəyi"];
const CITIES = ["Bakı", "Sumqayıt", "Gəncə", "Mingəçevir", "Şəki", "Lənkəran", "Naxçıvan", "Quba", "Şamaxı"];
window.CARALL_BRAND_MODELS = BRAND_MODELS;
window.CARALL_COLORS = COLORS;
window.CARALL_CITIES = CITIES;

const SALONS = [
  {
    "id": 1,
    "name": "MINI Azerbaijan",
    "slug": "mini-azerbaijan",
    "city": "Bakı",
    "address": "Nəsimi r., A.Salamzadə küç., 33",
    "description": "MINI avtomobillərinin Azərbaycanda rəsmi idxalçısı Improtex Motors.",
    "logo": "https://mediapool.bmwgroup.com/cache/P9/201506/P90188506/P90188506-the-new-mini-logo-06-2015-600px.jpg",
    "carsCount": 3,
    "phone": "+994501234567",
    "verified": true
  },
  {
    "id": 2,
    "name": "Auto Mall",
    "slug": "auto-mall",
    "city": "Bakı",
    "address": "Badamdar qəs., Maşın bazarı",
    "description": "Şəffaf və etibarlı avtomobil satışı xidməti.",
    "logo": "https://baza.az/storage/uploads/25/05/89d9cd37-40c7-41d9-bece-55faa4017655.webp",
    "carsCount": 26,
    "phone": "+994552223344",
    "verified": false
  },
  {
    "id": 3,
    "name": "Kia Azerbaijan",
    "slug": "kia-azerbaijan",
    "city": "Bakı",
    "address": "Nizami r., Babək pr., 43",
    "description": "Kia markasının Azərbaycanda rəsmi distribütoru.",
    "logo": "https://www.kiamedia.com/content/images/default/low.jpg",
    "carsCount": 18,
    "phone": "+994702223344",
    "verified": true
  },
  {
    "id": 4,
    "name": "Eco Auto",
    "slug": "eco-auto",
    "city": "Bakı",
    "address": "Nizami r., Babək pr., 61C",
    "description": "Yeni və işlənmiş avtomobillərin satışı.",
    "logo": "https://img.freepik.com/premium-vector/eco-car-logo-design_17005-393.jpg",
    "carsCount": 12,
    "phone": "+994505556677",
    "verified": false
  },
  {
    "id": 5,
    "name": "XPENG Azerbaijan",
    "slug": "xpeng-azerbaijan",
    "city": "Bakı",
    "address": "Babək pr., 74",
    "description": "XPENG brendinin Azərbaycanda rəsmi distribütoru.",
    "logo": "https://logowik.com/content/uploads/images/xpeng-motors8320.jpg",
    "carsCount": 10,
    "phone": "+994707778899",
    "verified": true
  },
  {
    "id": 6,
    "name": "AzCar Motors",
    "slug": "azcar-motors",
    "city": "Bakı",
    "address": "Nərimanov r., Azadlıq pr., 116",
    "description": "Geniş model seçimi və sərfəli təkliflər.",
    "logo": "https://dz9pgqdzwctgj.cloudfront.net/dealers/186/dealer-cover/d9f16afc-411d-4661-9b2c-7c913e3e2e5b/az-car-logo.svg",
    "carsCount": 40,
    "phone": "+994512223344",
    "verified": false
  },
  {
    "id": 7,
    "name": "Premium Cars Baku",
    "slug": "premium-cars-baku",
    "city": "Bakı",
    "address": "Xətai r., Nobel pr.",
    "description": "Premium sinif avtomobillər.",
    "logo": "https://img.freepik.com/premium-vector/luxury-car-logo-design-luxury-car-logo-design-template_995817-389.jpg",
    "carsCount": 22,
    "phone": "+994555551212",
    "verified": true
  },
  {
    "id": 8,
    "name": "Ganja Auto",
    "slug": "ganja-auto",
    "city": "Gəncə",
    "address": "Mərkəz küç.",
    "description": "Gəncə şəhərində etibarlı avtosalon.",
    "logo": "https://www.shutterstock.com/image-vector/auto-car-dealership-logo-emblem-600nw-2494083137.jpg",
    "carsCount": 15,
    "phone": "+994703334455",
    "verified": false
  },
  {
    "id": 9,
    "name": "Sumqayit Motors",
    "slug": "sumqayit-motors",
    "city": "Sumqayıt",
    "address": "Sülh pr.",
    "description": "Sumqayıt üzrə avtomobil satışı.",
    "logo": "https://www.avtovitrin.com/images/showrooms/36213847.png",
    "carsCount": 9,
    "phone": "+994502229999",
    "verified": false
  },
  {
    "id": 10,
    "name": "Elite Auto",
    "slug": "elite-auto",
    "city": "Bakı",
    "address": "Yasamal r.",
    "description": "Elit avtomobil modelləri.",
    "logo": "https://dcassetcdn.com/design_img/2685068/19317/19317_14565868_2685068_93f44f76_image.jpg",
    "carsCount": 17,
    "phone": "+994705551010",
    "verified": true
  },
  {
    "id": 11,
    "name": "Nakhchivan Auto",
    "slug": "nakhchivan-auto",
    "city": "Naxçıvan",
    "address": "Heydər Əliyev pr.",
    "description": "Naxçıvan üzrə rəsmi avtomobil satışı.",
    "logo": "https://i.pinimg.com/736x/e5/91/c4/e591c486148387dc347a7c83576ae807.jpg",
    "carsCount": 6,
    "phone": "+994706667788",
    "verified": false
  },
  {
    "id": 12,
    "name": "Caspian Motors",
    "slug": "caspian-motors",
    "city": "Bakı",
    "address": "Zığ yolu",
    "description": "Yeni nəsil avtomobil mərkəzi.",
    "logo": "https://aada.az/uploads/posts/2024-06/1719403353_news-copy.jpg",
    "carsCount": 28,
    "phone": "+994509998877",
    "verified": true
  }
];

// =========================
// RELATION AUTO SETUP (CARS -> SALONS / USERS)
// =========================
window.SALONS = SALONS;

const pick = (arr, n) => arr[n % arr.length];

CARS.forEach((c, i) => {
  // ownerType/ownerId yoxdursa, auto set et
  if (!("ownerType" in c) || !("ownerId" in c)) {
    if (c.adType === 3) {
      // ✅ SALON elanları: salonId ver
      // İstəsən random salon verək, city uyğun olanı seçək
      const citySalons = SALONS.filter(s => (s.city || "") === (c.city || ""));
      const salon = (citySalons.length ? pick(citySalons, c.id) : pick(SALONS, c.id));

      c.ownerType = "salon";
      c.ownerId = salon.id;      // ✅ relation burda
    } else {
      // ✅ Private elanları: userId ver (demo)
      c.ownerType = "user";
      c.ownerId = 1000 + (c.id % 200); // demo user id
    }
  }

  // private satıcı məlumatı yoxdursa auto doldur
  if (c.ownerType === "user") {
    if (!("sellerName" in c))  c.sellerName  = `Satıcı #${c.ownerId}`;
    if (!("sellerPhone" in c)) c.sellerPhone = "+99470" + String(1000000 + (c.id % 9000000)).slice(0,7);
    if (!("sellerSince" in c)) c.sellerSince = "03.2024";
    if (!("hidePhone" in c))   c.hidePhone   = true;
  }
});

