/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('ekskul').del()
  
  await knex('ekskul').insert([
    // Ketuhanan
    {
      "name": "ROHIS",
      "banner": "/uploads/ekskul/banner/rohis.jpeg",
      "bidang": "Ketuhanan"
    },
    {
      "name": "ROKRIS",
      "banner": "/uploads/ekskul/banner/rohkris.jpg",
      "bidang": "Ketuhanan"
    },

    // Bela Negara
    {
      "name": "PASKIBRA",
      "banner": "/uploads/ekskul/banner/paskibra.jpg",
      "bidang": "Bela Negara"
    },
    {
      "name": "PMR",
      "banner": "/uploads/ekskul/banner/pmr.jpg",
      "bidang": "Bela Negara"
    },
    {
      "name": "Pramuka",
      "banner": "/uploads/ekskul/banner/pramuka.jpg",
      "bidang": "Bela Negara"
    },
    {
      "name": "PKS",
      "banner": "/uploads/ekskul/banner/pks.jpg",
      "bidang": "Bela Negara"
    },

    // Pendidikan
    {
      "name": "Go Green",
      "banner": "/uploads/ekskul/banner/go-green.png",
      "bidang": "Pendidikan"
    },
    {
      "name": "Mading",
      "banner": "/uploads/ekskul/banner/mading.png",
      "bidang": "Pendidikan"
    },
    {
      "name": "English Club",
      "banner": "/uploads/ekskul/banner/english-club.png",
      "bidang": "Pendidikan"
    },
    {
      "name": "Korea",
      "banner": "/uploads/ekskul/banner/korea.png",
      "bidang": "Pendidikan"
    },

    // Teknologi
    {
      "name": "IT Club",
      "banner": "/uploads/ekskul/banner/it-club.png",
      "bidang": "Teknologi"
    },

    // Seni
    {
      "name": "Tari Tradisional",
      "banner": "/uploads/ekskul/banner/tari-tradisional.png",
      "bidang": "Seni"
    },
    {
      "name": "Teater",
      "banner": "/uploads/ekskul/banner/teater.png",
      "bidang": "Seni"
    },
    {
      "name": "Paduan Suara",
      "banner": "/uploads/ekskul/banner/paduan-suara.png",
      "bidang": "Seni"
    },
    {
      "name": "Band",
      "banner": "/uploads/ekskul/banner/band.png",
      "bidang": "Seni"
    },

    // PJOK
    {
      "name": "Taekwondo",
      "banner": "/uploads/ekskul/banner/taekwondo.png",
      "bidang": "PJOK"
    },
    {
      "name": "Pencak Silat",
      "banner": "/uploads/ekskul/banner/pencak-silat.png",
      "bidang": "PJOK"
    },
    {
      "name": "Bulu Tangkis",
      "banner": "/uploads/ekskul/banner/bulu-tangkis.png",
      "bidang": "PJOK"
    },
    {
      "name": "Voli",
      "banner": "/uploads/ekskul/banner/voli.png",
      "bidang": "PJOK"
    },
    {
      "name": "Futsal",
      "banner": "/uploads/ekskul/banner/futsal.png",
      "bidang": "PJOK"
    },
    {
      "name": "Basket",
      "banner": "/uploads/ekskul/banner/basket.png",
      "bidang": "PJOK"
    }
  ]);
};