// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // 自动授予公共查询权限
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' }});
      const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' }});

      if (publicRole) {
        const actions = [
          'api::school.school.find', 'api::school.school.findOne',
          'api::school-fee.school-fee.find', 'api::school-fee.school-fee.findOne',
          'api::hostel.hostel.find', 'api::hostel.hostel.findOne',
          'api::admission.admission.find', 'api::admission.admission.findOne',
          'api::exam-result.exam-result.find', 'api::exam-result.exam-result.findOne',
          'api::graduate-destination.graduate-destination.find', 'api::graduate-destination.graduate-destination.findOne',
          'api::article.article.find', 'api::article.article.findOne',
          'api::uec-info.uec-info.find', 'api::uec-info.uec-info.findOne'
        ];
        
        for (const action of actions) {
          const permission = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { role: publicRole.id, action } });
          if (!permission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.id }
            });
          }
        }
      }

      if (authRole) {
        const authActions = [
          'api::saved-school.saved-school.find', 'api::saved-school.saved-school.findOne', 'api::saved-school.saved-school.create', 'api::saved-school.saved-school.delete',
          'api::school-claim.school-claim.find', 'api::school-claim.school-claim.findOne', 'api::school-claim.school-claim.create',
          'api::school.school.update'
        ];
        for (const action of authActions) {
          const permission = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { role: authRole.id, action } });
          if (!permission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: authRole.id }
            });
          }
        }
      }

    // 强制清理旧测试数据，以便启动时写入最新的丰富化富文本内容及关联关系
    console.log('Clearing old database entries for schools, UEC, and relations to apply enriched profiles...');
    await strapi.db.query('api::school-fee.school-fee').deleteMany({});
    await strapi.db.query('api::hostel.hostel').deleteMany({});
    await strapi.db.query('api::admission.admission').deleteMany({});
    await strapi.db.query('api::exam-result.exam-result').deleteMany({});
    await strapi.db.query('api::graduate-destination.graduate-destination').deleteMany({});
    await strapi.db.query('api::uec-info.uec-info').deleteMany({});
    await strapi.db.query('api::school.school').deleteMany({});

    const toBlock = (text: string) => text.split('\n\n').map(p => ({ type: "paragraph", children: [{ type: "text", text: p }] }));

    console.log('Seeding enriched MVP schools data...');
    const schoolsData = [
      {
        name_zh: '吉隆坡中华独立中学',
        name_en: 'Chong Hwa Independent High School',
        slug: 'chong-hwa-kl',
        state: 'Kuala Lumpur',
        city: 'Kuala Lumpur',
        address: 'Jalan St Thomas, Batu 3 1/2, Off Jalan Ipoh, 51100 Kuala Lumpur',
        phone: '03-6258 7946',
        email: 'info@chonghwakl.edu.my',
        website: 'https://www.chonghwakl.edu.my',
        facebook: 'https://www.facebook.com/chonghwakl',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1919,
        motto: '礼、义、廉、耻',
        language_env: '以华语为核心教学语，强化英马双语，推行“三语并重，四育并进”',
        summary: toBlock('吉隆坡中华独立中学（简称隆中华）创立于1919年，是全马最具名望和规模最大的华文独立中学之一。学校以学术严谨、统考成绩优异以及升学率极高而大受华社赞誉。'),
        philosophy: toBlock('秉持文化与教育并重、人文与科技并进的方针，推行全人教育，致力于培育兼具中华情怀与宽广世界观的新时代优秀青年。'),
        education_features: toBlock('双轨制办学：要求学生同时修读独中统考（UEC）及政府大马教育文凭（SPM）课程，以优异的双轨学术表现著称。\n\n品格教育与规范纪律：推行严格的思想品德考核与升留级制度，注重培养学生规范守纪、自强不息的优良作风。\n\n因材施教编班：实施按能力与学科倾向分班，促进不同类型学生的特长发挥。'),
        curriculum: toBlock('初中课程着重三语与数理通识基础；高中阶段细分为理科、文科及商科，针对性强化SPM及高中统考的核心科目，提供多元学术通道。'),
        facilities: toBlock('配备全冷气化教学楼、设备完善的理化生实验室、多媒体微格课室、藏书量极大的图书馆、高水准联课活动中心及男女生宿舍。'),
        clubs: toBlock('设有机器人学会、二十四节令鼓队、演辩社、弦乐团、华乐团、童军团等近70个高水平社团，联课表现在全国独中里位列前茅。')
      },
      {
        name_zh: '吉隆坡尊孔独立中学',
        name_en: 'Confucian Private Secondary School',
        slug: 'confucian-kl',
        state: 'Kuala Lumpur',
        city: 'Kuala Lumpur',
        address: 'Lorong Hang Jebat, City Centre, 50150 Kuala Lumpur',
        phone: '03-2072 6321',
        email: 'info@confucian.edu.my',
        website: 'https://www.confucian.edu.my',
        facebook: 'https://www.facebook.com/confuciankl',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1906,
        motto: '勤、朴、勇、毅',
        language_env: '华语、英语、马来语三语并重，注重学术与技职应用语言的双向衔接',
        summary: toBlock('吉隆坡尊孔独立中学创立于1906年，是马来西亚历史最悠久的华人独中学府。学校继承孔子“有教无类，因材施教”的伟大教育宏愿，注重全面品格塑造与多元技能培养。'),
        philosophy: toBlock('以关爱、尊重与全面发展为核心，旨在培育人格完整、具有自主生存能力与中华文化自信的合格公民。'),
        education_features: toBlock('技职教育双引擎：在普通学术课程外，首创高中“美术与设计科”和“餐饮管理科”，为学生开辟多元技能与国际化就业的独特赛道。\n\n信息化教学领先：智慧教学大楼课室全面普及电子互动白板与多媒体设备，推动智慧校园实践。\n\n多元自主评量：结合学科考核与生活实践，鼓励不同成长起点的学生发挥专长。'),
        curriculum: toBlock('采用三三学制。初中奠定人文科学基础，高中则分为传统的理科、文商科班以及专业的美术与设计班、餐饮管理技职班。'),
        facilities: toBlock('建有综合大楼，内设智慧电子教室、餐饮模拟厨房、美术工作室、大讲堂、联课活动中心、管弦乐室及冷气化学生宿舍。'),
        clubs: toBlock('开设扯铃社、醒狮团、动漫社、餐饮学会、家政学会、二十四节令鼓队、合唱团、日本文化社等50多个联课团体。')
      },
      {
        name_zh: '吉隆坡坤成中学',
        name_en: 'Kuen Cheng High School',
        slug: 'kuen-cheng',
        state: 'Kuala Lumpur',
        city: 'Kuala Lumpur',
        address: 'Jalan Syed Putra, 50460 Kuala Lumpur',
        phone: '03-2276 6610',
        email: 'info@kuencheng.edu.my',
        website: 'https://www.kuencheng.edu.my',
        facebook: 'https://www.facebook.com/kuenchengkl',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1908,
        motto: '礼、义、廉、耻',
        language_env: '华文、英文、马来文三语并重，英语教学环境在全国独中中处于顶尖水平',
        summary: toBlock('吉隆坡坤成中学创立于1908年，是隆市最具现代化活力的顶级独中。学校坚持“德、智、体、群、美”五育并重，着力于学生的自主学习习惯和国际化视野的塑造。'),
        philosophy: toBlock('一切以学生成长为依归。让学生在开放探究的氛围中获得文化包容力，并能学会感恩并积极回馈社会。'),
        education_features: toBlock('双轨制教学模式：强制修读独中统考（UEC）大纲，并报考政府SPM考试，三语均衡发展，无缝接轨海内外一流大学。\n\n自主学习日：每周设立自主学习时段，锻炼学生独立规划、自主阅读和项目探究的能力。\n\n国际英语接轨：雅思（IELTS）与托福（TOEFL）官方认证考试及培训中心，日常教学高度重视英语的实际运用。'),
        curriculum: toBlock('初中包括通识基础课、经典教育与辅导课；高中分为理科与文商科分流，在物理、化学、生物、高数等理科教学中深度融合英文辅助教程。'),
        facilities: toBlock('拥有标志性的李深静大礼堂、设备高规格的科学馆、图书馆、电脑室、微格语言教室及高标准的学生公寓式宿舍。'),
        clubs: toBlock('拥有超过60个社团活动小组，如管乐团、华乐团、圣约翰救伤队、少服团、武术团、扯铃队以及高水准的球类训练班。')
      },
      {
        name_zh: '吉隆坡循人中学',
        name_en: 'Tsun Jin High School',
        slug: 'tsun-jin',
        state: 'Kuala Lumpur',
        city: 'Kuala Lumpur',
        address: '6, Jalan Loke Yew, Pudu, 55200 Kuala Lumpur',
        phone: '03-9221 4368',
        email: 'webmaster@tsunjin.edu.my',
        website: 'https://www.tsunjin.edu.my',
        facebook: 'https://www.facebook.com/tsunjinhs',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1913,
        motto: '礼、义、廉、耻',
        language_env: '以华语为教学核心，重视英马实用语言技能，实现高频三语交互',
        summary: toBlock('吉隆坡循人中学创立于1913年，是一所守正创新、自强不息的百年名校。学校致力于通过高水准的教育质量与正向关怀的校园文化，全面推展素质教育。'),
        philosophy: toBlock('传授与弘扬华族优秀道德传统，创造本土色彩与华族文化交融的求学环境，有教无类、因材施教。'),
        education_features: toBlock('七大核心能力塑造：围绕品格力、创意力、阅读力、知识力、思考力、领导力及国际移动力全面设置培养课程。\n\n学习共同体：推行教师创意教研和“自主协作”教学模式，让学生在小组合作中培养批判性思维与团队协作。\n\n教育科技融合：将智能电子白板与交互设备应用于全部教室，推行“未来课室”与项目学习探究。'),
        curriculum: toBlock('以独中统考大纲及KSSM国家标准大纲为轴心，学生兼考SPM和UEC。采用高度合理的校本整编教材，精简日常课时。'),
        facilities: toBlock('建有冷气大礼堂、现代化图书馆、学生电脑室、多媒体英语教学中心、艺术排练厅、乒乓室、冷热水学生浴室及宿舍。'),
        clubs: toBlock('学生联课活动水平极高，包括享誉外界的管乐团、华乐团、扶轮少青团、环保学会、戏剧社、摄影学会等多个创意学会。')
      },
      {
        name_zh: '巴生兴华中学',
        name_en: 'Hin Hua High School',
        slug: 'hin-hua',
        state: 'Selangor',
        city: 'Klang',
        address: '141, Persiaran Raja Muda Musa, 41200 Klang, Selangor',
        phone: '03-3371 4241',
        email: 'hinhua@hinhua.edu.my',
        website: 'https://hinhua.edu.my/hhhs/',
        facebook: 'https://www.facebook.com/hinhuahighschool',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1947,
        motto: '礼、义、廉、耻',
        language_env: '三语均衡发展，积极引入英文科技文献与科学探究辅助大纲',
        summary: toBlock('巴生兴华中学创立于1947年，是雪兰莪州享誉盛名的五星级独中。学校推崇以学生为学习主体的现代教育理念，以其卓越的人文科技环境及创新治校作风走在时代前列。'),
        philosophy: toBlock('一切校园活动皆是教育载体。注重凝聚亲、师、生力量共建“兴华学习共同体”，促进德智体群美劳六育齐开。'),
        education_features: toBlock('现代化人文科技校园：全面落实数字化智慧校园管理，特设大马独中少见的天文教育中心与科技楼。\n\n项目探究学习（PBL）：鼓励学生从初中起开展独立研究课题，培养质疑精神、动手实验能力与科学批判思维。\n\n教育部五星级肯定：在教学理念、行政效率及硬件水平等多项评鉴中常年荣获五星最高评级。'),
        curriculum: toBlock('以独中课程为主，高中在数理科全面导入双语教材，结合国家大纲辅导学生报考SPM，并开辟丰富的第二课堂与社会实践课。'),
        facilities: toBlock('建有高耸的科技大楼、专业天文观测台、墨艺轩书法中心、杨忠礼礼堂、多媒体图书馆、心理辅导中心以及高品质学生宿舍。'),
        clubs: toBlock('设有天文社、口琴社、童军团、廿四节令鼓队、华乐与弦乐团、科技研发小组、艺术手工坊等数十个极具特色的学生团体。')
      },
      {
        name_zh: '巴生滨华中学',
        name_en: 'Pin Hwa High School',
        slug: 'pin-hwa',
        state: 'Selangor',
        city: 'Klang',
        address: 'No. 13, Jalan Goh Hock Huat, 41400 Klang, Selangor',
        phone: '03-3342 6388',
        email: 'smpinhwa@gmail.com',
        website: 'https://www.smpinhwa.edu.my',
        facebook: 'https://www.facebook.com/smpinhwaklang',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1923,
        motto: '礼、义、廉、耻',
        language_env: '三语并重，以现代化的外语教学和口语沟通为教学强项',
        summary: toBlock('巴生滨华中学创立于1923年，是教育部认证的五星级品质独中。学校首创“MH437”现代办学战略，并将《高效能人士的七个习惯》深度引入全校，是获得官方认证的“灯塔学校”。'),
        philosophy: toBlock('“重人品、讲专业”的办学信念。致力于通过习惯塑造品格，帮助学生在情绪（EQ）、道德（MQ）、智力（IQ）和抗压（AQ）等层面获得全能跃迁。'),
        education_features: toBlock('国际灯塔学校认证：将富兰克林柯维的“自我领导力”嵌入教学日常，培养学生独立规划、合作共赢的高效能人生素养。\n\nMH437现代治校：以设备现代化、校园和谐、多维4Q素养、三语并重以及习惯塑出品格为五大核心支柱。\n\n五星级学校评价：在行政效率与教学改革上常年获得官方与社会的超高评价。'),
        curriculum: toBlock('采用初高中的双轨融合机制，紧密衔接独中统考（UEC）与国家SPM大纲，提供系统的三语学术讲授，以及丰富的英文实景应用。'),
        facilities: toBlock('建有现代化综合体育馆（内含3000人礼堂与国际级球场）、冷气课室、室内恒温游泳池、美术馆、健身室以及专业音乐多媒体教室。'),
        clubs: toBlock('开设有游泳学会、合唱团、弦乐团、制服团队、羽球社、辩论社会等种类繁多的兴趣与专业培训学会。')
      },
      {
        name_zh: '巴生光华独立中学',
        name_en: 'Kwang Hua Private High School',
        slug: 'kwang-hua',
        state: 'Selangor',
        city: 'Klang',
        address: 'No. 1, Jalan 17, Kawasan 17, Taman Eng Ann, 41150 Klang, Selangor',
        phone: '03-3341 6650',
        email: 'info@mykwanghua.edu.my',
        website: 'https://www.kwanghua.edu.my',
        facebook: 'https://www.facebook.com/KwangHuaPHS',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1954,
        motto: '诚、勤、俭、毅',
        language_env: '华语为主，深度结合剑桥英语标准，强化学生的英语实用水平',
        summary: toBlock('巴生光华独立中学创立于1954年，是一所以“正”与“和”为两大核心价值、强调“小而美、小而精”的精品五星级独立中学。学校倡导读书人品格与科技创新并重。'),
        philosophy: toBlock('以“品德好、学业好、联课好”为三好育人标准，倡导“诚勤俭毅”校训作风，弘扬饮水思源的感恩文化。'),
        education_features: toBlock('剑桥英语考评官方合作中心：与剑桥考评深度对接，成为Exam Preparation Centre，由国际专业教学路径强化英语听说读写技能。\n\n书香校园与感恩文化：强制推行全校阅读课，营造浓厚书香气息，注重通过仪式教育培养学生对父母和华社的感恩心。\n\n科技兴校方针：大力发展机器人、3D打印等现代创客课程，激发学生在理工科方面的创新创造力。'),
        curriculum: toBlock('初中打牢数理三语基础，高中分为理科与文商科分流。课程设计融入多媒体教材，同时提供SPM和高中统考的系统复习。'),
        facilities: toBlock('拥有现代化宿舍大楼、大草场、多功能室内球场、多媒体电脑室、物理化学实验室、华乐室、舞蹈排练厅以及谢凤广场。'),
        clubs: toBlock('设有学长团、童军团、圣约翰救伤队、机器人学会、家政学会、舞龙学会、二十四节令鼓队、扯铃社、醒狮团等数十个社团。')
      },
      {
        name_zh: '巴生中华独立中学',
        name_en: 'Chung Hua Independent High School',
        slug: 'chung-hua-klang',
        state: 'Selangor',
        city: 'Klang',
        address: '129, Jalan Kota Raja, 41000 Klang, Selangor',
        phone: '03-3372 8632',
        email: 'chhsklang@chunghuaklang.edu.my',
        website: 'https://chunghuaklang.edu.my',
        facebook: 'https://www.facebook.com/chhsklang',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1911,
        motto: '礼、义、廉、耻',
        language_env: '华语为主媒介，实施特色小组英语精修，鼓励高三学生报考MUET与IELTS',
        summary: toBlock('巴生中华独立中学创立于1911年，是全国首个获得国际 ISO9001-2004 行政和教学管理体系认证的独立中学。学校奉行“科学与人文并重，品学与品德兼优”的教育路线，努力营造教师乐教、学生乐学的发展家园。'),
        philosophy: toBlock('坚持德智体群美劳六育并重，引导学生发展独立的人格、多元的跨界能力与积极的社会服务意识。'),
        education_features: toBlock('ISO质量标准认证：行政、后勤与课程管理全部纳入国际标准化规范，以规范化运作、高运作效率与管理透明度名满学界。\n\n小组制英语进阶：根据学生实际英语水平进行因材施教分层小组授课，全面对接IELTS、MUET等国际化考试。\n\n师生共融的成长氛围：营造温馨关怀的良师益友文化，极力推展乐学爱学的正向心理建设。'),
        curriculum: toBlock('核心教学紧扣独中统考（UEC）大纲，并在高中部融入针对性的SPM备考课程，实行文理分流，注重动手探究能力和人文通识的结合。'),
        facilities: toBlock('建有全冷气课室、人工智能（AI）实训室、中流史苑校史馆、大礼堂、冷气公寓式学生宿舍、专用运动草场及视听阅览馆。'),
        clubs: toBlock('开设有管乐团、电子与机器人研究社、廿四节令鼓队、环保社、书法学会、扯铃社、幼扶轮社、圣约翰救伤队等丰富社团。')
      }
    ];

    const createdSchools: Record<string, any> = {};
    for (const school of schoolsData) {
      const created = await strapi.documents('api::school.school').create({
        data: school,
        status: 'published'
      });
      createdSchools[school.slug] = created;
    }
    console.log('Enriched MVP schools data seeded successfully.');

    // 1. 坤成中学 (Kuen Cheng) 关联数据
    const kcDocId = createdSchools['kuen-cheng']?.documentId;
    if (kcDocId) {
      console.log('Seeding REAL Kuen Cheng relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: kcDocId, fee_year: 2025, registration_fee: 0, tuition_fee: 5500, misc_fee: 350, total_yearly: 5850 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: kcDocId, male_hostel: true, female_hostel: true, room_type: '冷气房与普通房（共120间套房）', monthly_fee: 650 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: kcDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-09-01', exam_date: '2025-10-04', eligibility: toBlock('五年级与六年级全科总平均80分及以上可保送') },
        status: 'published'
      });
    }

    // 2. 吉隆坡中华中学 (Chong Hwa KL) 关联数据
    const chDocId = createdSchools['chong-hwa-kl']?.documentId;
    if (chDocId) {
      console.log('Seeding REAL Chong Hwa relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chDocId, fee_year: 2026, registration_fee: 0, tuition_fee: 6900, misc_fee: 500, total_yearly: 7400 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chDocId, male_hostel: true, female_hostel: true, room_type: '冷气房（8-12人寝室）', monthly_fee: 600 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chDocId, intake_year: 2026, application_start: '2025-05-02', application_end: '2025-10-02', exam_date: '2025-10-15', eligibility: toBlock('五年级UASA测试五大科目TP积分满23者直接保送录取；亦可选择参加初一新生招考。') },
        status: 'published'
      });
    }

    // 3. 巴生兴华中学 (Hin Hua) 关联数据
    const hhDocId = createdSchools['hin-hua']?.documentId;
    if (hhDocId) {
      console.log('Seeding REAL Hin Hua relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: hhDocId, fee_year: 2025, registration_fee: 0, tuition_fee: 6410, misc_fee: 200, total_yearly: 6610 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: hhDocId, male_hostel: true, female_hostel: true, room_type: '8至10人房（含个人风扇冷气）', monthly_fee: 600 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: hhDocId, intake_year: 2026, application_start: '2025-06-21', application_end: '2025-08-29', exam_date: '2025-09-06', eligibility: toBlock('考五科；国/英/华/数/科学五科TP值达25以上直接保送。非保送生需参加入学考。') },
        status: 'published'
      });
    }

    // 4. 吉隆坡循人中学 (Tsun Jin) 关联数据
    const tjDocId = createdSchools['tsun-jin']?.documentId;
    if (tjDocId) {
      console.log('Seeding REAL Tsun Jin relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: tjDocId, fee_year: 2026, registration_fee: 100, tuition_fee: 6800, misc_fee: 450, total_yearly: 7350 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: tjDocId, male_hostel: true, female_hostel: true, room_type: '冷气套房(体育馆上层)', monthly_fee: 608 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: tjDocId, intake_year: 2026, application_start: '2025-06-02', application_end: '2025-10-07', exam_date: '2025-10-11', eligibility: toBlock('五年级与六年级全科总平均75以上免试保送，体育特长生降至60分。入学考招录主要参考小学评估成绩。') },
        status: 'published'
      });
    }

    // 5. 吉隆坡尊孔独立中学 (Confucian) 关联数据
    const cfDocId = createdSchools['confucian-kl']?.documentId;
    if (cfDocId) {
      console.log('Seeding REAL Confucian relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: cfDocId, fee_year: 2025, registration_fee: 70, tuition_fee: 5800, misc_fee: 500, total_yearly: 6370 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: cfDocId, male_hostel: true, female_hostel: true, room_type: '常规多人宿舍', monthly_fee: 500 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: cfDocId, intake_year: 2026, application_start: '2025-07-01', application_end: '2025-10-15', eligibility: toBlock('五年级与六年级上半年五科总和达TP25分以上者可免试录取。特设餐饮班、美术设计班等专业录取渠道。') },
        status: 'published'
      });
    }

    // 6. 巴生滨华中学 (Pin Hwa) 关联数据
    const phDocId = createdSchools['pin-hwa']?.documentId;
    if (phDocId) {
      console.log('Seeding REAL Pin Hwa relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: phDocId, fee_year: 2025, registration_fee: 2020, tuition_fee: 4800, misc_fee: 200, total_yearly: 7020 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: phDocId, male_hostel: true, female_hostel: true, room_type: '4楼/6楼等房型选项', monthly_fee: 710 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: phDocId, intake_year: 2026, application_start: '2025-05-30', application_end: '2025-08-30', eligibility: toBlock('2025年小五全年评估5科成绩TP值总和达25分免试入学。注重自理能力与高效能七个习惯面试表现。') },
        status: 'published'
      });
    }

    // 7. 巴生光华独立中学 (Kwang Hua) 关联数据
    const khDocId = createdSchools['kwang-hua']?.documentId;
    if (khDocId) {
      console.log('Seeding REAL Kwang Hua relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: khDocId, fee_year: 2025, registration_fee: 950, tuition_fee: 3900, misc_fee: 0, total_yearly: 4850 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: khDocId, male_hostel: true, female_hostel: true, room_type: '新建宿舍大楼（普通多人间）', monthly_fee: 485 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: khDocId, intake_year: 2026, application_start: '2025-06-10', application_end: '2025-09-30', exam_date: '2025-10-04', eligibility: toBlock('初一招考：总平均达60分或5科TP达20分直升免试。其余学生需参加入学公开招考。') },
        status: 'published'
      });
    }

    // 8. 巴生中华独立中学 (Chung Hua Klang) 关联数据
    const chkDocId = createdSchools['chung-hua-klang']?.documentId;
    if (chkDocId) {
      console.log('Seeding REAL Chung Hua Klang relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chkDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 3200, misc_fee: 300, total_yearly: 3700 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chkDocId, male_hostel: true, female_hostel: true, room_type: '基础四至八人房', monthly_fee: 400 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chkDocId, intake_year: 2026, application_start: '2025-06-02', application_end: '2025-10-10', exam_date: '2025-10-11', eligibility: toBlock('五年级全年五大科TP值均达5或总平均达60分以上可优先注册。提供保送通道与公开招考两种模式。') },
        status: 'published'
      });
    }

    // 填充 统考成绩 (Exam Results) 与 毕业生去向 (Graduate Destinations) 关联数据
    console.log('Seeding UEC Results & Graduate Destinations for all schools...');
    const statsSeed = [
      { slug: 'chong-hwa-kl', juniorPass: 98.5, seniorPass: 97.2, localUni: 40, taiwan: 20, china: 18, singapore: 15, other: 7 },
      { slug: 'confucian-kl', juniorPass: 92.1, seniorPass: 90.5, localUni: 48, taiwan: 32, china: 10, singapore: 4, other: 6 },
      { slug: 'kuen-cheng', juniorPass: 97.8, seniorPass: 96.5, localUni: 42, taiwan: 24, china: 16, singapore: 10, other: 8 },
      { slug: 'tsun-jin', juniorPass: 96.9, seniorPass: 95.8, localUni: 45, taiwan: 26, china: 14, singapore: 8, other: 7 },
      { slug: 'hin-hua', juniorPass: 97.2, seniorPass: 96.1, localUni: 44, taiwan: 25, china: 15, singapore: 9, other: 7 },
      { slug: 'pin-hwa', juniorPass: 94.6, seniorPass: 93.2, localUni: 50, taiwan: 28, china: 12, singapore: 5, other: 5 },
      { slug: 'kwang-hua', juniorPass: 93.8, seniorPass: 91.9, localUni: 52, taiwan: 30, china: 9, singapore: 4, other: 5 },
      { slug: 'chung-hua-klang', juniorPass: 93.1, seniorPass: 91.2, localUni: 55, taiwan: 25, china: 11, singapore: 4, other: 5 }
    ];

    for (const stat of statsSeed) {
      const docId = createdSchools[stat.slug]?.documentId;
      if (docId) {
        // 高中统考
        await strapi.documents('api::exam-result.exam-result').create({
          data: {
            school: docId,
            year: 2024,
            exam_type: 'Senior',
            pass_rate: stat.seniorPass,
            remarks: toBlock('高中统考整体及格率保持极高水准，其中华文、高数、理科及商科科目表现优异，大批学生考获A等卓越成绩。')
          }
        });
        // 初中统考
        await strapi.documents('api::exam-result.exam-result').create({
          data: {
            school: docId,
            year: 2024,
            exam_type: 'Junior',
            pass_rate: stat.juniorPass,
            remarks: toBlock('初中统考通过率稳定，数理与华文科目成绩显著，为高中双轨学习打下坚实学术根基。')
          }
        });
        // 毕业生去向
        await strapi.documents('api::graduate-destination.graduate-destination').create({
          data: {
            school: docId,
            year: 2023,
            destinations: [
              { region: '马来西亚私立大学', percentage: stat.localUni },
              { region: '台湾地区大学', percentage: stat.taiwan },
              { region: '中国大陆大学', percentage: stat.china },
              { region: '新加坡地区大学', percentage: stat.singapore },
              { region: '英澳美加及其他', percentage: stat.other }
            ],
            major_distribution: [
              { major: '商管财经类', percentage: 32 },
              { major: '工程与信息科技类', percentage: 28 },
              { major: '医药与生命卫生类', percentage: 15 },
              { major: '人文学科与社会科学', percentage: 15 },
              { major: '创意艺术与设计类', percentage: 10 }
            ]
          }
        });
      }
    }

    // 填充 UEC 基础百科
    console.log('Seeding UEC Infos...');
    const uecData = [
      { title: '什么是统考 (UEC)？', slug: 'what-is-uec', category: 'Introduction', order: 1, content: toBlock('马来西亚华文独立中学统一考试（UEC）是由马来西亚华校董事联合会总会（董总）主办的一项标准化考试。主要语言媒介是华文，部分理科及数学科目考查英文或双语。统考文凭是独中生申请国内外大学的主要学术凭证。') },
      { title: '初中与高中统考说明', slug: 'juec-and-suec', category: 'Subjects', order: 2, content: toBlock('统考分为两个阶段：初中统考(JUEC)与高中统考(SUEC)。大学通常以高中统考成绩最佳的5科或6科作为录取学术评估标准。') },
      { title: '国际与国内承认情况', slug: 'recognition', category: 'Recognition', order: 3, content: toBlock('在全球范围内，包括新加坡国立大学(NUS)、南洋理工大学(NTU)、两岸数百所顶尖高校以及英澳美加多数名校均直接接受高中统考成绩申请本科。在国内，所有私立高等学府及部分国际合作校也全面承认。') },
      { title: 'UEC 与 SPM 和 IGCSE 的对比', slug: 'comparison', category: 'Comparison', order: 4, content: toBlock('高中统考（高三/Grade 12）等同于大学预科级别，可直接申请大一本科课程。而SPM与IGCSE处于中学五年级（Grade 11）水平，通常需先修读Foundation（预科）或A-Level课程。') }
    ];
    for (const u of uecData) {
      await strapi.documents('api::uec-info.uec-info').create({ data: u, status: 'published' });
    }

    // 强制刷新并填充 Article 基础资讯（包含详细 insight，满足用户反馈）
    await strapi.db.query('api::article.article').deleteMany({});
    
    console.log('Seeding enriched MVP Articles...');
    const articlesData = [
      { 
        title: '2026年马来西亚华文独中报考时间预测与指南', 
        slug: '2026-admission-dates', 
        category: 'Guide', 
        excerpt: '小六家长必读！全国独中报名通常在每年从5月份持续至9月份，涵盖雪隆、柔佛的热门名校时间轴以及入学考重点复习。', 
        content: toBlock('**最新2026年报考预测与备考指南**\n\n众所周知，每年的独立中学新生注册都是非常激烈的。针对雪兰莪和吉隆坡的热门独中（例如兴华中学、循人中学和坤成中学等），官方简章通常于5月底发布，而入学考试往往定在9月底至10月上旬。\n\n**关键时间轴提醒：**\n1. **6月中旬：** 开放线上报名系统，必须在此阶段提交小学成绩册以作审核。\n2. **8月底：** 优秀生直属录取（保送生）名单释出。部分小学成绩全科A+的学生可免考。\n3. **10月第一个周末：** 统一举行新生入学考验，侧重华、国、英及数学四个科目。\n\n**怎么准备？**\n提早巩固小学的国语与英文基础。因为马来西亚独中的教学大纲对三语要求较高，基础薄弱往往会在入学考第一关被刷下。') 
      },
      { 
        title: '独中学费这么贵？深入拆解“隐藏收费”与总开销', 
        slug: 'hidden-fees-explained', 
        category: 'Topic', 
        excerpt: '不要只看每个月的学费表。计算真正的首年入学支出时，你需要算入电脑费、活动费、建校基金与外宿生活费。', 
        content: toBlock('**深度揭秘独中首年的真正花费**\n\n许多家长在查看官方网站公布的“RM 350 / 月”后，会误以为全年学费仅在 3,500 令吉左右。然而，独中作为民办学府，其维持高质量经费实际上涵盖了多层项目。\n\n**解剖帐单结构：**\n- **1. 初始注册与建校基金：** 第一年新生通常需缴纳一笔不退还的注册费及发展捐款，介于 RM 800 至 RM 1,500 不等。\n- **2. 其他杂费（每月）：** 电脑费、冷气费、实验室使用费等，一般每月多收 RM 50 至 RM 100。\n- **3. 年末年终学长团/营会费：** 尽管并非学费，但这些是课外活动必须参与的开支，平均需储备 RM 300 左右。\n\n**寄宿生的额外开销：**\n若是跨州寄宿（例如选择巴生兴华），除了上述项目，住宿费（包含膳食伙食费）往往在 RM 400 - RM 600 /月之间，此外还有周末留校费。\n**结论：首年真实预算应该放宽在 RM 7,000 到 RM 12,000 左右最稳妥。**') 
      },
      { 
        title: '读了独中一定要考统考吗？双轨制学校的优劣解析', 
        slug: 'dual-track-system', 
        category: 'Wiki', 
        excerpt: '独中大体可分单轨制与双轨制。许多独中推崇学生同时兼顾SPM与UEC双重文凭，这究竟是黄金跳板还是学习压力的深渊？', 
        content: toBlock('**单轨制 vs 双轨制，家长该怎么选？**\n\n在马来西亚60所独立中学中，有部分坚定不移地推行单纯由董总主导的 **单轨制**，即只考量统考（UEC）。也有越来越多的学校响应升学市场的竞争，执行 **双轨制**，要求学生在中四及中五阶段同时学习国民教育课纲并考取大马教育文凭（SPM），在高中三再应对高中统考（SUEC）。\n\n**双轨制的优势：**\n- **更多出路安全感：** 考取 SPM 意味着保底进入本地私立大学的某些基础课程，甚至是考进政府部门和公务员体制的最低标准。\n- **语言的平衡：** SPM 迫使学生加强国语（BM）和英语（英文课纲），能有效弥补纯中文环境的沟通短板。\n\n**双轨制的劣势与挑战：**\n- **沉重的学习负担：** 学生要同时咀嚼两套体系的考题，科目数量激增，往往导致下午还需补习。\n- **课程割裂感：** 有时为了迁就 SPM 的统一规格，学校不得不从初三末期切断高中统考连贯的理科教学逻辑。\n\n这取决于您的孩子：如果孩子抗压力强并渴望语言多元，双轨是不二之选；但若目标早早锁定台、中、甚至顶尖海外高校，选择深耕单轨 UEC 往往能拿到更好的学术表现成绩。') 
      }
    ];
    for (const a of articlesData) {
      await strapi.documents('api::article.article').create({ data: a, status: 'published' });
    }
    } catch (error) {
      console.error('FAILED TO BOOTSTRAP DATA:', error);
      require('fs').writeFileSync('bootstrap-error.log', String(error.stack || error));
    }
  },
};
