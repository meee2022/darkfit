import { mutation } from "./_generated/server";

// Helper function to convert ✅ / ❌ to boolean
const b = (val: string) => val === "✅";

const rawData = `
# أطباق رئيسية|Main Dishes|lunch
1	مجبوس دجاج	Chicken Machboos	158	17.0	17.2	2.4	✅	✅	✅
2	مجبوس لحم	Meat Machboos	167	16.9	16.9	3.0	✅	✅	✅
3	مجبوس ربيان	Shrimp Machboos	145	14.0	18.0	2.0	✅	✅	✅
4	كبسة دجاج	Chicken Kabsa	170	18.6	17.4	2.8	✅	✅	✅
5	كبسة لحم	Meat Kabsa	165	17.0	16.5	3.5	✅	✅	✅
6	مندي دجاج	Chicken Mandi	155	14.6	17.9	2.3	✅	✅	✅
7	مندي لحم	Meat Mandi	147	11.9	20.3	1.9	✅	✅	✅
8	مظبي دجاج	Chicken Madhbi	160	16.0	16.5	3.0	✅	✅	✅
9	برياني دجاج	Chicken Biryani	141	15.4	14.0	2.5	✅	✅	✅
10	برياني لحم	Meat Biryani	143	18.0	13.1	2.6	✅	✅	✅
11	بخاري دجاج	Chicken Bukhari Rice	169	18.6	17.4	2.8	✅	✅	✅
12	بخاري لحم	Meat Bukhari Rice	133	22.5	7.8	1.3	✅	✅	✅
13	غوزي دجاج	Chicken Ghouzi	161	10.1	22.7	3.3	✅	✅	✅
14	غوزي لحم	Meat Ghouzi	167	11.4	22.4	3.4	✅	✅	✅
15	مقلوبة دجاج	Chicken Maqluba	155	12.0	18.0	4.5	✅	✅	✅
16	مقلوبة لحم	Meat Maqluba	160	13.0	17.5	5.0	✅	✅	✅
17	كشري	Koshari	175	6.0	31.0	2.5	❌	✅	✅
18	ملوخية بالدجاج	Molokhia with Chicken	110	11.0	6.0	4.5	✅	✅	✅
19	ملوخية باللحم	Molokhia with Meat	115	12.0	6.0	5.0	✅	✅	✅
20	منسف	Mansaf	195	14.0	18.0	7.5	❌	✅	✅
# أطباق خليجية تقليدية|Traditional Gulf Dishes|lunch
21	هريس	Harees	76	9.0	8.3	0.7	✅	✅	✅
22	هريس لحم	Meat Harees	85	10.5	8.0	1.2	✅	✅	✅
23	ثريد دجاج	Chicken Thareed	107	6.8	12.1	3.5	✅	✅	✅
24	ثريد لحم	Meat Thareed	115	8.0	11.5	4.0	✅	✅	✅
25	مضروبة	Madrouba	64	8.6	5.3	0.9	✅	✅	✅
26	بلاليط	Balaleet	199	5.5	30.4	6.1	❌	✅	✅
27	قيمة	Qeema	100	7.5	7.4	4.5	✅	✅	✅
28	مرقوق دجاج	Chicken Margoug	95	7.0	11.0	2.5	✅	✅	✅
29	مرقوق لحم	Meat Margoug	100	8.0	10.5	3.0	✅	✅	✅
30	جريش	Jareesh	110	5.0	18.0	2.0	✅	✅	✅
31	عريكة	Areeka	320	5.0	48.0	12.0	❌	✅	✅
32	حسو	Hasu	135	2.9	14.9	7.1	❌	✅	✅
33	عصيدة	Asida	243	4.3	29.6	11.9	❌	✅	✅
34	إلبة	Ilba (Emirati Stew)	118	4.3	17.8	3.3	✅	✅	✅
35	باجلة	Bajella (Fava Beans Stew)	99	6.2	16.3	1.0	✅	✅	✅
36	دال عدس	Dal Lentils	93	4.5	13.2	2.5	✅	✅	✅
37	صالونة دجاج	Chicken Saloona	90	8.5	7.0	3.0	✅	✅	✅
38	صالونة لحم	Meat Saloona	100	10.0	6.5	3.5	✅	✅	✅
39	مجبوس ربيان	Shrimp Machboos	145	14.0	18.0	2.0	✅	✅	✅
40	هامور مع رز	Hamour with Rice	139	27.3	0	3.2	✅	✅	✅
# مشاوي ولحوم|Grills & Meats|lunch
41	تكة دجاج	Chicken Tikka	165	31.0	1.0	3.6	✅	✅	✅
42	تكة لحم	Meat Tikka	181	35.3	1.2	3.9	✅	✅	✅
43	كباب لحم مشوي	Grilled Meat Kebab	223	25.2	1.6	13.0	✅	✅	✅
44	كباب دجاج	Chicken Kebab	180	28.0	2.0	6.5	✅	✅	✅
45	شيش طاووق	Shish Tawook	170	29.0	3.0	4.5	✅	✅	✅
46	كفتة مشوية	Grilled Kofta	230	20.0	4.0	15.0	✅	✅	✅
47	ريش غنم مشوية	Grilled Lamb Chops	250	24.0	0	17.0	✅	✅	❌
48	دجاج مشوي (فخذ)	Grilled Chicken Thigh	209	26.0	0	10.9	✅	✅	✅
49	دجاج مشوي (صدر)	Grilled Chicken Breast	165	31.0	0	3.6	✅	✅	✅
50	دجاج مشوي (جناح)	Grilled Chicken Wing	203	30.0	0	8.1	✅	✅	✅
51	هامور مشوي	Grilled Hamour Fish	109	19.3	0.2	3.4	✅	✅	✅
52	ربيان مشوي	Grilled Shrimp	87	19.7	0	0.8	✅	✅	✅
53	سمك مشوي	Grilled Fish	105	20.0	0	2.5	✅	✅	✅
54	كبدة دجاج	Chicken Liver	157	24.4	0.9	5.5	✅	✅	❌
55	كبدة غنم	Lamb Liver	184	22.7	6.7	6.8	✅	✅	❌
# شاورما وساندويتشات|Shawarma & Sandwiches|lunch
56	شاورما دجاج	Chicken Shawarma	225	20.6	23.9	5.2	❌	✅	✅
57	شاورما لحم	Meat Shawarma	227	20.0	22.2	6.4	❌	✅	✅
58	فتة شاورما	Shawarma Fatteh	238	8.8	17.5	13.8	❌	❌	❌
59	ساندويتش فلافل	Falafel Sandwich	259	7.2	28.8	12.0	❌	✅	✅
60	ساندويتش كباب	Kebab Sandwich	245	15.0	25.0	9.5	❌	✅	✅
61	بروستد دجاج	Broasted Chicken	247	18.7	12.0	14.0	❌	✅	✅
62	زنجر دجاج	Chicken Zinger	260	16.0	22.0	12.5	❌	❌	❌
63	معكرونة بالدجاج	Chicken Pasta	130	17.9	10.0	1.9	✅	✅	✅
# مقبلات وسلطات|Appetizers & Salads|snack
64	حمص بالطحينة	Hummus	166	8.0	14.3	9.6	✅	✅	✅
65	متبل باذنجان	Baba Ghanoush	130	3.0	10.0	9.0	✅	✅	✅
66	تبولة	Tabbouleh	90	2.5	10.0	4.5	✅	✅	✅
67	فتوش	Fattoush	110	2.0	12.0	6.0	✅	✅	✅
68	ورق عنب (محشي)	Stuffed Grape Leaves	125	7.5	16.1	2.7	✅	✅	✅
69	محشي كوسا	Stuffed Zucchini	86	4.9	14.7	1.5	✅	✅	✅
70	محشي فلفل	Stuffed Bell Pepper	90	5.0	13.0	2.0	✅	✅	✅
71	فلافل (طعمية)	Falafel	333	13.3	31.8	17.8	❌	✅	✅
72	فول مدمس	Ful Medames	110	7.9	19.7	0.4	✅	✅	✅
73	فتة حمص	Fatteh Hummus	190	7.0	17.5	10.0	❌	✅	✅
74	لبنة	Labneh	160	10.0	6.0	11.0	✅	✅	✅
75	سلطة عربية	Arabic Salad	45	1.5	6.0	2.0	✅	✅	✅
76	سلطة يونانية	Greek Salad	100	4.0	5.0	7.5	✅	✅	✅
# أسماك ومأكولات بحرية|Seafood|lunch
77	سمك مقلي	Fried Fish	211	23.7	0	13.0	❌	✅	✅
78	ربيان مقلي	Fried Shrimp	242	21.4	11.4	12.3	❌	✅	✅
79	صيادية سمك	Fish Sayadieh	165	15.0	18.0	3.5	✅	✅	✅
80	زبيدي مشوي	Grilled Zubaidi Fish	115	21.0	0	3.5	✅	✅	✅
81	سمك فيليه مشوي	Grilled Fish Fillet	100	22.0	0	1.5	✅	✅	✅
# إفطار عربي|Arabic Breakfast|breakfast
82	شكشوكة	Shakshuka	140	8.0	8.0	9.0	✅	✅	✅
83	فول بالزيت	Ful with Olive Oil	140	8.0	20.0	3.5	✅	✅	✅
84	بيض مسلوق	Boiled Eggs	155	13.0	1.1	11.0	✅	✅	✅
85	بيض مقلي	Fried Eggs	196	13.6	0.8	15.3	✅	✅	✅
86	عجة بيض	Egg Omelette	154	10.6	1.6	12.0	✅	✅	✅
87	جبنة حلوم مشوية	Grilled Halloumi	363	16.4	8.2	29.4	❌	✅	✅
88	جبنة بيضاء	White Cheese (Feta)	264	14.2	4.1	21.3	✅	✅	✅
89	زعتر بزيت	Zaatar with Olive Oil	420	8.0	35.0	28.0	❌	✅	✅
90	مناقيش زعتر	Zaatar Manakeesh	280	6.0	35.0	13.0	❌	✅	✅
91	مناقيش جبنة	Cheese Manakeesh	310	11.0	30.0	16.0	❌	✅	✅
92	بليلة (حمص مسلوق)	Boiled Chickpeas Balila	164	8.9	27.4	2.6	✅	✅	✅
# أطعمة رمضان|Ramadan Foods|snack
93	سمبوسة جبن	Cheese Sambosa	418	10.4	49.7	19.8	❌	✅	✅
94	سمبوسة لحم	Meat Sambosa	310	12.0	30.0	15.0	❌	✅	✅
95	سمبوسة خضار	Vegetable Sambosa	275	5.1	33.3	13.6	❌	✅	✅
96	سمبوسة دجاج	Chicken Sambosa	295	13.0	28.0	14.0	❌	✅	✅
97	لقيمات	Luqaimat	275	3.0	44.4	9.5	❌	✅	✅
98	تمر (رطب)	Fresh Dates (Rutab)	282	2.5	75.0	0.4	❌	✅	✅
99	تمر مجدول	Medjool Dates	277	1.8	75.0	0.2	❌	✅	✅
100	تمر بلبن	Dates with Milk	112	3.2	20.8	1.6	❌	✅	✅
101	شوربة عدس	Lentil Soup	80	5.0	13.0	0.8	✅	✅	✅
102	شوربة حب	Grain Soup (Habb)	95	4.5	15.0	2.0	✅	✅	✅
103	شوربة شوفان	Oat Soup	70	3.0	12.0	1.5	✅	✅	✅
104	فتة لحم	Meat Fatteh	210	12.0	18.0	10.0	❌	✅	❌
105	وربات بالقشطة	Warbat with Cream	350	5.0	38.0	20.0	❌	❌	✅
# حلويات عربية|Arabic Sweets|snack
106	كنافة بالجبن	Kunafa with Cheese	410	8.0	45.0	22.0	❌	❌	✅
107	كنافة بالقشطة	Kunafa with Cream	400	6.0	48.0	20.0	❌	❌	✅
108	بسبوسة	Basbousa	360	4.0	52.0	15.0	❌	❌	✅
109	قطايف بالجبن	Qatayef with Cheese	320	8.0	38.0	15.0	❌	❌	✅
110	قطايف بالقشطة	Qatayef with Cream	350	6.0	42.0	18.0	❌	❌	✅
111	بقلاوة	Baklava	430	7.0	38.0	28.0	❌	❌	✅
112	محلبية	Muhalabiya	108	2.9	17.6	2.9	❌	✅	✅
113	أم علي	Om Ali	250	6.0	30.0	12.0	❌	❌	✅
114	خنفروش	Khanfaroosh	316	6.3	50.1	10.1	❌	❌	✅
115	خبيصة	Khabisa	305	3.5	58.6	6.3	❌	❌	✅
116	بثيث	Bathith	352	2.6	71.0	6.4	❌	❌	✅
117	عقيلي	Aqili Cake	352	10.1	56.7	9.4	❌	❌	✅
118	رز بالحليب	Rice Pudding	130	3.5	22.0	3.0	❌	✅	✅
# مشروبات|Beverages|snack
119	لبن عيران	Ayran Laban	36	1.7	2.6	1.9	✅	✅	✅
120	لبن رائب	Buttermilk (Rayeb)	40	3.3	4.8	0.9	✅	✅	✅
121	قمر الدين	Qamar Al Din	110	0.5	27.0	0.1	❌	✅	✅
122	جلاب	Jallab	100	0.3	25.0	0	❌	✅	✅
123	فالودة	Falooda	85	0.9	18.4	0.9	❌	✅	✅
124	تمر هندي	Tamarind Juice	120	0.5	30.0	0.1	❌	✅	✅
125	سوبيا	Sobia	90	1.0	20.0	1.0	❌	✅	✅
126	حليب كامل الدسم	Full Fat Milk	64	3.5	5.5	3.0	✅	✅	✅
127	حليب قليل الدسم	Low Fat Milk	50	3.3	4.7	2.0	✅	✅	✅
128	زبادي يوناني	Greek Yogurt	65	10.0	4.0	0.4	✅	✅	✅
129	شاي كرك	Karak Tea	80	1.5	12.0	3.0	❌	✅	❌
130	قهوة عربية (بدون سكر)	Arabic Coffee (no sugar)	2	0.1	0	0	✅	✅	❌
131	قهوة تركية (بدون سكر)	Turkish Coffee (no sugar)	5	0.3	0.7	0	✅	✅	❌
# خبز ونشويات أساسية|Bread & Staples|snack
132	خبز عربي أبيض	White Arabic Bread	275	9.2	55.0	1.2	❌	✅	✅
133	خبز عربي أسمر	Whole Wheat Arabic Bread	247	10.0	49.0	1.8	✅	✅	✅
134	خبز تنور	Tannour Bread	260	8.0	52.0	1.5	❌	✅	✅
135	خبز صامولي	Samoli Bread	290	9.0	54.0	3.5	❌	✅	✅
136	أرز أبيض مطبوخ	Cooked White Rice	130	2.7	28.2	0.3	❌	✅	✅
137	أرز بسمتي مطبوخ	Cooked Basmati Rice	121	3.5	25.2	0.4	✅	✅	✅
138	أرز بني مطبوخ	Cooked Brown Rice	112	2.6	23.5	0.9	✅	✅	✅
139	فريكة مطبوخة	Cooked Freekeh	130	5.0	24.0	1.5	✅	✅	✅
140	برغل مطبوخ	Cooked Bulgur	83	3.1	18.6	0.2	✅	✅	✅
141	عيش شيلاني	Chelani Rice	172	3.1	31.3	3.8	❌	✅	✅
# مكسرات وسناكات|Nuts & Snacks|snack
142	لوز	Almonds	579	21.2	21.7	49.9	✅	✅	✅
143	جوز	Walnuts	654	15.2	13.7	65.2	✅	✅	✅
144	كاجو	Cashews	553	18.2	30.2	43.9	✅	✅	✅
145	فستق	Pistachios	560	20.2	27.2	45.3	✅	✅	✅
146	بذور دوار الشمس	Sunflower Seeds	584	20.8	20.0	51.5	✅	✅	✅
147	تمر محشي لوز	Dates Stuffed with Almonds	310	4.0	65.0	5.0	❌	✅	✅
148	مكسرات مشكلة	Mixed Nuts	595	17.0	21.0	52.0	✅	✅	✅
# بروتينات صحية|Healthy Proteins|snack
149	تونة معلبة (بالماء)	Canned Tuna in Water	116	25.5	0	0.8	✅	✅	✅
150	تونة معلبة (بالزيت)	Canned Tuna in Oil	198	29.1	0	8.2	✅	✅	✅
151	بيض مسلوق	Boiled Egg	155	13.0	1.1	11.0	✅	✅	✅
152	صدر ديك رومي	Turkey Breast	104	24.0	0	1.0	✅	✅	✅
153	جبنة قريش	Cottage Cheese	98	11.1	3.4	4.3	✅	✅	✅
154	توفو	Tofu	76	8.0	1.9	4.8	✅	✅	✅
`;

const parseData = () => {
  const lines = rawData.trim().split('\n');
  const processed = [];
  let currentCategoryAr = "";
  let currentCategoryEn = "";
  let currentMealType: any = "snack";

  for (const line of lines) {
    if (line.startsWith("#")) {
      const parts = line.replace("#", "").trim().split("|");
      currentCategoryAr = parts[0];
      currentCategoryEn = parts[1] || "";
      currentMealType = parts[2] || "snack";
      continue;
    }
    
    if (!line.trim()) continue;

    const cols = line.split('\t').map(x => x.trim());
    if (cols.length < 10) continue;

    processed.push({
      nameAr: cols[1],
      name: cols[2],
      caloriesPer100g: parseFloat(cols[3]),
      proteinPer100g: parseFloat(cols[4]),
      carbsPer100g: parseFloat(cols[5]),
      fatPer100g: parseFloat(cols[6]),
      isDiabeticFriendly: b(cols[7]),
      isSeniorFriendly: b(cols[8]),
      isChildFriendly: b(cols[9]),
      categoryAr: currentCategoryAr,
      category: currentCategoryEn,
      mealType: currentMealType,
    });
  }
  return processed;
};

export const upsertFoods = mutation({
  handler: async (ctx) => {
    const foodsToInsert = parseData();
    let updatedCount = 0;
    let insertedCount = 0;

    for (const food of foodsToInsert) {
      // Find matches by English name OR Arabic name to avoid duplication
      const existing = await ctx.db
        .query("foods")
        .filter((q) =>
          q.or(
            q.eq(q.field("name"), food.name),
            q.eq(q.field("nameAr"), food.nameAr)
          )
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: food.name,
          nameAr: food.nameAr,
          category: food.category,
          categoryAr: food.categoryAr,
          mealType: food.mealType,
          caloriesPer100g: food.caloriesPer100g,
          proteinPer100g: food.proteinPer100g,
          carbsPer100g: food.carbsPer100g,
          fatPer100g: food.fatPer100g,
          isDiabeticFriendly: food.isDiabeticFriendly,
          isSeniorFriendly: food.isSeniorFriendly,
          isChildFriendly: food.isChildFriendly,
        });
        updatedCount++;
      } else {
        await ctx.db.insert("foods", {
          name: food.name,
          nameAr: food.nameAr,
          category: food.category,
          categoryAr: food.categoryAr,
          mealType: food.mealType,
          caloriesPer100g: food.caloriesPer100g,
          proteinPer100g: food.proteinPer100g,
          carbsPer100g: food.carbsPer100g,
          fatPer100g: food.fatPer100g,
          isDiabeticFriendly: food.isDiabeticFriendly,
          isSeniorFriendly: food.isSeniorFriendly,
          isChildFriendly: food.isChildFriendly,
        });
        insertedCount++;
      }
    }

    return { updatedCount, insertedCount };
  },
});
