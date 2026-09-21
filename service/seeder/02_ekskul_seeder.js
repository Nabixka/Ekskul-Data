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
      "bidang": "Ketuhanan",
      "about": "Wadah pembinaan kerohanian Islam siswa untuk memperdalam ilmu agama dan mempererat ukhuwah islamiyah di lingkungan sekolah. Melalui kegiatan kajian rutin, mentoring, dan peringatan hari besar Islam, anggota dibimbing untuk mengamalkan nilai-nilai akhlakul karimah dalam kehidupan sehari-hari. Ekstrakurikuler ini juga bertujuan untuk mencetak generasi muda yang religius, berkarakter luhur, serta memiliki kepedulian sosial yang tinggi."
    },
    {
      "name": "ROKRIS",
      "banner": "/uploads/ekskul/banner/rohkris.jpg",
      "bidang": "Ketuhanan",
      "about": "Kelompok kegiatan kerohanian Kristen yang membimbing siswa dalam mendalami ajaran iman Kristiani secara mendalam dan kontekstual. Kegiatan utama meliputi pendalaman Alkitab, persekutuan doa bersama, serta paduan suara rohani untuk memperkuat keimanan. Melalui komunitas ini, siswa diajak untuk meneladani kasih Kristus dalam membangun toleransi, kebersamaan, dan kedisiplinan."
    },

    // Bela Negara
    {
      "name": "PASKIBRA",
      "banner": "/uploads/ekskul/banner/paskibra.jpg",
      "bidang": "Bela Negara",
      "about": "Wadah pembinaan kedisiplinan, pelatihan teknik baris-berbaris (PBB), serta penanaman jiwa nasionalisme yang kuat bagi peserta didik. Anggota dilatih secara fisik dan mental untuk siap bertugas dalam upacara pengibaran bendera maupun berbagai ajang perlombaan ketangkasan. Ekstrakurikuler ini berkomitmen untuk melahirkan kader pemimpin bangsa yang memiliki loyalitas tinggi, integritas, dan rasa cinta tanah air."
    },
    {
      "name": "PMR",
      "banner": "/uploads/ekskul/banner/pmr.jpg",
      "bidang": "Bela Negara",
      "about": "Ekstrakurikuler Palang Merah Remaja yang melatih keterampilan pertolongan pertama pada kecelakaan serta kesiapsiagaan dalam menghadapi bencana. Siswa dibekali pengetahuan medis dasar, perawatan keluarga, serta pemahaman mendalam mengenai prinsip-prinsip kepalangmerahan. Organisasi ini membentuk relawan muda yang sigap, berjiwa kemanusiaan tinggi, dan selalu siap membantu sesama."
    },
    {
      "name": "Pramuka",
      "banner": "/uploads/ekskul/banner/pramuka.jpg",
      "bidang": "Bela Negara",
      "about": "Organisasi kepanduan resmi yang melatih kemandirian, kecintaan terhadap alam bebas, serta kerja sama tim berlandaskan Dasa Dharma. Berbagai kegiatan lapangan seperti perkemahan, sandi, pioneering, dan Survival diselenggarakan untuk menguji ketangkasan mental maupun fisik siswa. Ekstrakurikuler ini menjadi wadah pembentukan karakter generasi muda yang tangguh, terampil, dan bertanggung jawab."
    },
    {
      "name": "PKS",
      "banner": "/uploads/ekskul/banner/pks.jpg",
      "bidang": "Bela Negara",
      "about": "Patroli Keamanan Sekolah yang bertugas secara aktif membantu ketertiban dan kelancaran lalu lintas di area sekitar gerbang sekolah. Anggota dibekali pelatihan kedisiplinan berlalu lintas, peraturan baris-berbaris, serta dasar-dasar pengamanan lingkungan sekolah. Kegiatan ini melatih siswa untuk memiliki rasa tanggung jawab sosial yang tinggi serta kepatuhan terhadap hukum."
    },

    // Pendidikan
    {
      "name": "Go Green",
      "banner": "/uploads/ekskul/banner/go-green.png",
      "bidang": "Pendidikan",
      "about": "Klub lingkungan hidup sekolah yang berfokus pada pelestarian alam, pengelolaan sampah mandiri, serta aksi penghijauan area sekolah. Anggota diajak untuk melakukan kampanye sadar lingkungan, merawat tanaman apotek hidup, dan mendaur ulang sampah anorganik menjadi produk bernilai. Kegiatan ini bertujuan untuk menumbuhkan kesadaran ekologis sejak dini demi terciptanya lingkungan belajar yang asri dan berkelanjutan."
    },
    {
      "name": "Mading",
      "banner": "/uploads/ekskul/banner/mading.png",
      "bidang": "Pendidikan",
      "about": "Wadah kreativitas siswa dalam bidang jurnalistik, penulisan artikel sastra, dan desain tata letak majalah dinding sekolah. Anggota dilatih untuk meliput kegiatan sekolah, menyusun berita yang objektif, serta merangkai estetika visual agar informasi menarik untuk dibaca. Ekstrakurikuler ini mengasah kemampuan berpikir kritis, literasi tulis, serta keterampilan komunikasi massa."
    },
    {
      "name": "English Club",
      "banner": "/uploads/ekskul/banner/english-club.png",
      "bidang": "Pendidikan",
      "about": "Komunitas pengembangan kemampuan berbahasa Inggris melalui metode interaktif seperti _public speaking_, debat, drama, dan _storytelling_. Siswa diberikan ruang seluas-luasnya untuk melatih kepercayaan diri dalam berbicara menggunakan bahasa asing tanpa merasa takut salah. Klub ini dirancang untuk meningkatkan daya saing global peserta didik di era modern."
    },
    {
      "name": "Korea",
      "banner": "/uploads/ekskul/banner/korea.png",
      "bidang": "Pendidikan",
      "about": "Klub apresiasi budaya dan pembelajaran bahasa Korea yang mencakup tata bahasa dasar, aksara Hangeul, serta percakapan sehari-hari. Selain bahasa, anggota juga mempelajari berbagai aspek kebudayaan tradisional maupun pop-kultur Korea secara edukatif. Kegiatan ini memperluas wawasan internasional siswa terhadap keragaman budaya global."
    },

    // Teknologi
    {
      "name": "IT Club",
      "banner": "/uploads/ekskul/banner/it-club.png",
      "bidang": "Teknologi",
      "about": "Komunitas teknologi dan pemrograman komputer untuk mengeksplorasi pengembangan web, aplikasi mobile, serta dasar-dasar jaringan. Anggota dibimbing langsung untuk mengerjakan proyek nyata berbasis kode, memecahkan masalah logika, dan mendesain antarmuka digital. Ekstrakurikuler ini sangat ideal bagi siswa yang ingin mengasah keterampilan digital dan siap menghadapi industri teknologi masa kini."
    },

    // Seni
    {
      "name": "Tari Tradisional",
      "banner": "/uploads/ekskul/banner/tari-tradisional.png",
      "bidang": "Seni",
      "about": "Sanggar seni tari yang berdedikasi untuk melestarikan, mempelajari, dan mementaskan berbagai ragam tarian tradisional dari seluruh nusantara. Anggota dilatih mengenai keluwesan gerak tubuh, pengenalan pola lantai, serta penghayatan makna filosofis di balik setiap tarian daerah. Kegiatan ini menumbuhkan rasa bangga terhadap warisan budaya bangsa sekaligus menjadi pengisi berbagai acara resmi sekolah."
    },
    {
      "name": "Teater",
      "banner": "/uploads/ekskul/banner/teater.png",
      "bidang": "Seni",
      "about": "Wadah seni peran yang melatih ekspresi emosi, teknik olah vokal, improvisasi panggung, dan manajemen pementasan drama. Siswa diajak untuk mengeksplorasi karakter naskah cerita yang mendalam guna membangun rasa percaya diri di depan publik. Melalui pementasan rutin, teater mengajarkan arti kerja sama tim, empati sosial, dan apresiasi seni peran."
    },
    {
      "name": "Paduan Suara",
      "banner": "/uploads/ekskul/banner/paduan-suara.png",
      "bidang": "Seni",
      "about": "Kelompok vokal sekolah yang berfokus pada pelatihan teknik pernapasan, pembagian suara harmonis, dan penyanyian lagu-lagu nasional maupun daerah. Anggota dilatih secara disiplin di bawah bimbingan pelatih vokal profesional untuk tampil memukau dalam setiap upacara maupun acara penting. Ekstrakurikuler ini mengasah kepekaan pendengaran musikal serta kekompakan kelompok."
    },
    {
      "name": "Band",
      "banner": "/uploads/ekskul/banner/band.png",
      "bidang": "Seni",
      "about": "Wadah kreatif bagi siswa yang memiliki minat dan bakat dalam memainkan alat musik modern serta bernyanyi secara kolaboratif. Anggota diberikan kesempatan untuk meracik aransemen musik, berlatih ritme secara sinkron, dan tampil unjuk gigi dalam pameran seni sekolah. Klub ini menyalurkan energi positif remaja melalui apresiasi seni musik yang dinamis."
    },

    // PJOK
    {
      "name": "Taekwondo",
      "banner": "/uploads/ekskul/banner/taekwondo.png",
      "bidang": "PJOK",
      "about": "Seni bela diri asal Korea yang berfokus pada kecepatan tendangan, kekuatan fisik, ketahanan mental, serta kedisiplinan tingkat tinggi. Siswa dilatih tahap demi tahap sesuai jenjang sabuk, mulai dari teknik dasar hingga teknik pertarungan tanding yang kompetitif. Ekstrakurikuler ini membentuk mental juara yang tangguh, tangkas, dan menjunjung tinggi sportivitas."
    },
    {
      "name": "Pencak Silat",
      "banner": "/uploads/ekskul/banner/pencak-silat.png",
      "bidang": "PJOK",
      "about": "Ekstrakurikuler bela diri tradisional asli Indonesia untuk menjaga kebugaran jasmani serta melestarikan warisan budaya leluhur. Anggota mempelajari teknik jurus pasang, tangkisan, kuncian, dan seni bela diri praktis yang mengutamakan kelenturan tubuh. Selain untuk perlindungan diri, kegiatan ini menanamkan nilai-nilai budi luhur dan jiwa kesatria."
    },
    {
      "name": "Bulu Tangkis",
      "banner": "/uploads/ekskul/banner/bulu-tangkis.png",
      "bidang": "PJOK",
      "about": "Wadah latihan fisik dan peningkatan teknik permainan cabang olahraga bulu tangkis bagi siswa yang berorientasi prestasi. Melalui latihan kelincahan, akurasi pukulan _smash_, dan strategi penempatan kok, fisik siswa akan terjaga tetap prima. Klub ini rutin menjaring bibit-bibit atlet berbakat untuk mewakili sekolah di berbagai ajang kejuaraan."
    },
    {
      "name": "Voli",
      "banner": "/uploads/ekskul/banner/voli.png",
      "bidang": "PJOK",
      "about": "Kegiatan olahraga bola voli yang menekankan pentingnya komunikasi kilat, kerja sama tim, dan koordinasi fisik yang solid. Siswa dilatih teknik dasar _passing_, _smash_, _blocking_, serta strategi penyerangan dalam pertandingan beregu. Ekstrakurikuler ini efektif dalam membangun kebugaran tubuh serta mempererat solidaritas antar-siswa."
    },
    {
      "name": "Futsal",
      "banner": "/uploads/ekskul/banner/futsal.png",
      "bidang": "PJOK",
      "about": "Klub olahraga sepak bola ruangan yang sangat diminati untuk mengasah keterampilan mengolah bola di ruang sempit. Anggota dilatih strategi taktik tim, kecepatan reaksi _passing_, serta ketahanan fisik untuk menghadapi kompetisi antar-sekolah. Kegiatan ini menyalurkan hobi positif siswa sekaligus membangun mental sportivitas yang tinggi."
    },
    {
      "name": "Basket",
      "banner": "/uploads/ekskul/banner/basket.png",
      "bidang": "PJOK",
      "about": "Ekstrakurikuler bola basket yang melatih ketangkasan menggiring bola, akurasi tembakan _shoot_, serta strategi permainan cepat. Anggota digembleng secara fisik agar memiliki stamina tinggi serta kerja sama tim yang padu di atas lapangan. Klub ini berkomitmen melahirkan tim basket sekolah yang kompetitif dan berprestasi gemilang."
    }
  ]);
};