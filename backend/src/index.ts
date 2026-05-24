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
      },
      {
        name_zh: '怡保培南独立中学',
        name_en: 'Poi Lam High School',
        slug: 'poi-lam-ipoh',
        state: 'Perak',
        city: 'Ipoh',
        address: 'Lot No. 18274, Jalan Simpang Pulai, Pengkalan, 31500 Lahat, Ipoh, Perak',
        phone: '05-3218120',
        email: 'poilam@poilam.edu.my',
        website: 'https://www.poilam.edu.my',
        facebook: 'https://www.facebook.com/poilamipoh',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1955,
        motto: '冲出怡保，走向世界，迈向全球化',
        language_env: '三语并重，首创英国剑桥O-Level/IGCSE及A-Level课程体系，英语环境在北马地区处于领先水平',
        summary: toBlock('怡保培南独立中学创立于1955年，由霹雳福建公会创办，是北马及霹雳州最具代表性的现代化华文独立中学之一。学校以推行多轨制教学以及首创剑桥国际教育体系闻名于全国。'),
        philosophy: toBlock('秉承“冲出怡保，走向世界，迈向全球化”的教育信念，提供多元的学术发展跑道，因材施教，致力于培养具有国际竞争力与社会责任感的全方位人才。'),
        education_features: toBlock('多元学术轨制：全国首家引入剑桥O-Level/IGCSE及A-Level英语体系的独中，同时开办全国独中统考（UEC）与政府大马教育文凭（SPM）课程，为学子开辟广阔的前程路径。\n\n国际生签证与寄宿：具备招收国际学生的官方资格，提供完善的学生签证支持与英语强化辅导，吸引来自全球多个国家 and 地区的学子入读。\n\n全人教育与品格重塑：注重传统儒家价值观与国际前沿视野的结合，倡导多元自主评量和高效能生活习惯培养。'),
        curriculum: toBlock('初中打牢数理与三语功底；高中细分为理科、文商科及剑桥国际班，数理科目均提供高质量双语教学辅导，实现与世界一流大学的无缝接轨。'),
        facilities: toBlock('占地面积广阔的现代化校园，配备高标准冷气教室、多媒体语言实验室、高规格物理化学实验室、现代化图书馆、室内体育馆以及学生公寓式男女生宿舍。'),
        clubs: toBlock('开设醒狮团、管乐团、二十四节令鼓队、演辩社、机器人学会、武术团、圣约翰救伤队等近50个极具活力与创意的社团。')
      },
      {
        name_zh: '怡保深斋中学',
        name_en: 'Shen Jai High School',
        slug: 'shen-jai-ipoh',
        state: 'Perak',
        city: 'Ipoh',
        address: 'Lot No. 6452, Off Jalan Gopeng, 31300 Ipoh, Perak',
        phone: '05-3126612',
        email: 'info@shenjai.edu.my',
        website: 'https://www.shenjai.edu.my',
        facebook: 'https://www.facebook.com/shenjaiipoh',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1959,
        motto: '自力更生，天天向上',
        language_env: '以华语为主媒介，强化英文，推行三语并重',
        summary: toBlock('怡保深斋中学创立于1959年，由霹雳客家公会及万铎先生等客家领袖创办。学校以纪律严明、校风淳朴和商科、数理科统考表现出色而闻名全国。'),
        philosophy: toBlock('秉承“自力更生，天天向上”的校训，实施德智体群美全人教育，致力于发掘学生自主潜能，培育造福华人社会与马国多元发展的栋梁之才。'),
        education_features: toBlock('商科与数理强项：商科（簿记与会计、商业学）和理科教学水平卓越，历年统考及格率与特优率均高居霹雳州前列。\n\n严格规范的管理：以纪律严明著称，思想品德考核与升留级制度十分完善，深受广大华社家长的信赖。\n\n信息化智慧校园：全面普及多媒体电子教室，推动网络教学管理与教研模式的深度结合。'),
        curriculum: toBlock('初中实施通识基础课；高中细分为理科、商科和文商科分流，紧扣统考大纲并辅导SPM考试，满足双轨备考路径。'),
        facilities: toBlock('宽敞优美的冷气教学楼、藏书丰富的多功能图书馆、专业理化生实验室、多媒体微格教室及设施高标准男生、女生宿舍。'),
        clubs: toBlock('拥有扯铃社、廿四节令鼓队、醒狮团、管乐团、演辩社、羽球社等近50个极具特色与活力的学生联课团体。')
      },
      {
        name_zh: '怡保育才独立中学',
        name_en: 'Yuk Choy High School',
        slug: 'yuk-choy-ipoh',
        state: 'Perak',
        city: 'Ipoh',
        address: 'Jalan Jelapang, 30020 Ipoh, Perak',
        phone: '05-5267912',
        email: 'info@yukchoy.edu.my',
        website: 'https://www.yukchoy.edu.my',
        facebook: 'https://www.facebook.com/yukchoyipoh',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1908,
        motto: '礼、义、廉、耻',
        language_env: '华语为主媒介，重视三语沟通与实际生活运用',
        summary: toBlock('怡保育才独立中学前身创立于1908年，由当地热心教育的华人先贤创办，是马来西亚最悠久的华文学府之一。学校以注重母语教育、传承优秀中华文化和全人素质教育著称。'),
        philosophy: toBlock('坚持母语为核心教育媒介，传授与弘扬优秀道德传统，为华社子女提供有教无类、因材施教的高质量中等教育。'),
        education_features: toBlock('深厚人文积淀：拥有超过一个世纪的办校历史，弘扬传统儒家文化与民族教育尊严，是北马华教的重要灯塔。\n\n多元升学跑道：开辟独中统考课程以及SPM政府课程的灵活选择组合，让不同能力起点的学生都能找到最佳赛道。\n\n丰富的联课生活：鼓励学生在活动中学习领导、合作与自我管理，实现个性化的全面成长。'),
        curriculum: toBlock('初中实施基础三语及通识教育；高中细分为理科、文商科分流，并在教学中导入丰富的实战课题。'),
        facilities: toBlock('建有庄严的大礼堂、理化生科学馆、多媒体微格电脑室、冷气宿舍、学生阅览室及绿意盎然的运动场。'),
        clubs: toBlock('拥有享誉外界的学长团、华乐团、童军团、红新月会、书法学会、二十四节令鼓队等多个社团。')
      },
      {
        name_zh: '太平华联独立中学',
        name_en: 'Hua Lian High School',
        slug: 'hua-lian-taiping',
        state: 'Perak',
        city: 'Taiping',
        address: '2, Jalan Tokong, 34000 Taiping, Perak',
        phone: '05-8072208',
        email: 'info@hualian.edu.my',
        website: 'https://www.hualian.edu.my',
        facebook: 'https://www.facebook.com/hualianipoh',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1913,
        motto: '礼、义、廉、耻',
        language_env: '华语为主，强化英马实用技能，实现三语交交互融',
        summary: toBlock('太平华联独立中学创立于1913年，由数所早期华人义学合并而成，是雨城太平最具历史底蕴的华人学府。学校积极推展素质教育，融汇传统文化与现代创新科技。'),
        philosophy: toBlock('弘扬“礼义廉耻”校训精神，倡导德智体群美劳六育齐开，为北马地区学子共建“温馨和谐、乐教爱学”的智慧成长家园。'),
        education_features: toBlock('书香与品格薰陶：注重规范化的品德考核、孝道传统和书香校园建设，营造浓厚的传统人文关怀氛围。\n\n多元备考模式：紧扣独中统考（UEC）大纲，并在高中部融入针对性的SPM辅导，毕业出路覆盖国内外一流高校。\n\n优质小班教学：在部分班级引入特色小组协作模式，全面提升日常课堂的互动性与学生专注力。'),
        curriculum: toBlock('初中打牢数理三语基础；高中细分为传统的理科与文商科分流，注重动手探究能力和人文通识的结合。'),
        facilities: toBlock('拥有现代化教学大楼、大礼堂、电脑室、设备高规格的物理化学实验室、华乐室及冷气学生宿舍。'),
        clubs: toBlock('开设有学长团、制服团队、二十四节令鼓队、扯铃队、少服团、武术学会等丰富多彩的联课社团。')
      },
      {
        name_zh: '安顺三民独立中学',
        name_en: 'San Min Secondary School',
        slug: 'san-min-teluk-intan',
        state: 'Perak',
        city: 'Teluk Intan',
        address: 'Jalan Sungai Nibong, 36000 Teluk Intan, Perak',
        phone: '05-6221622',
        email: 'info@sanmin.edu.my',
        website: 'https://www.sanmin.edu.my',
        facebook: 'https://www.facebook.com/sanmintelukintan',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1929,
        motto: '礼、义、廉、耻',
        language_env: '华语为主媒介，结合剑桥英语大纲精修，强化学生英语实用能力',
        summary: toBlock('安顺三民独立中学创立于1929年，是下霹雳地区及周边村镇极其重要的华文教育摇篮。学校在文体活动、商科及三语教学上展现出坚实的办学水平。'),
        philosophy: toBlock('秉承“三民五育”宗旨，培养具有华族文化情怀、世界观以及乐于社会服务之有为青年。'),
        education_features: toBlock('三语实战能力：实施英语分层教学，结合剑桥英语大纲，鼓励高三学生报考MUET与IELTS等国际化英语测试。\n\n多元技职融合：在普通学术课程外，规划引入多维实践课，为不同学术特长的学生开辟广阔的出路通道。\n\n师生亲密关怀：营造温馨友好的良师益友关系，强调关怀教育与正向心理建设的实际结合。'),
        curriculum: toBlock('高中部执行双轨教学，兼顾独中统考（UEC）和国家SPM大纲，奠定扎实的跨语种基础。'),
        facilities: toBlock('建有庄严的校史馆、大礼堂、冷气多媒体电脑室、物理化学实验室、运动大草场以及舒适的学生公寓式宿舍。'),
        clubs: toBlock('开设有管乐团、环保社、廿四节令鼓队、学长团、红新月会、少青团等数十个富有特色的学会。')
      },
      {
        name_zh: '金宝培元独立中学',
        name_en: 'Pei Yuan Secondary School',
        slug: 'pei-yuan-kampar',
        state: 'Perak',
        city: 'Kampar',
        address: '9, Jalan Kuala Dipang, 31900 Kampar, Perak',
        phone: '05-4651351',
        email: 'info@peiyuan.edu.my',
        website: 'https://www.peiyuan.edu.my',
        facebook: 'https://www.facebook.com/peiyuankampar',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1912,
        motto: '自强不息',
        language_env: '以华语为核心教学媒介，注重英马实际沟通水平的双向提高',
        summary: toBlock('金宝培元独立中学创立于1912年，是锡矿古镇金宝历史最悠久的华人独立中学之一。学校注重儒家道德风骨、科学探索精神与三语基础的有机融合。'),
        philosophy: toBlock('坚持“自强不息”的精神，致力于为马国培养具有高尚情操、扎实学问和健全人格的一流国民。'),
        education_features: toBlock('儒家书香熏陶：强调道德与修养，实施系统的行为规范评定与经典古籍诵读，塑造尊师重道的风气。\n\n双轨学术跑道：辅导学生同时应对独中统考及国家SPM考试，保障学生拥有海内外双向无缝升学保障。\n\n科技创客探索：结合现代教育趋势，逐步导入创客空间和机器人基础教学，激发学生的理工科兴趣。'),
        curriculum: toBlock('采用初高中三三学制。初中实施华文、国语、英文及科学数理通识基础课；高中分设理科及文商科。'),
        facilities: toBlock('配有冷气教学大楼、大礼堂、科学中心、多媒体图书资讯室、男女生冷气学生宿舍。'),
        clubs: toBlock('开设有口琴社、华乐团、学长团、环保学会、制服团队等多个富有特色的兴趣小组。')
      },
      {
        name_zh: '实兆远南华独立中学',
        name_en: 'Nan Hwa High School',
        slug: 'nan-hwa-sitiawan',
        state: 'Perak',
        city: 'Ayer Tawar',
        address: 'Lot No. 2446, Kampung Sungai Wangi, 32400 Ayer Tawar, Manjung, Perak',
        phone: '05-6913506',
        email: 'info@nanhwa.edu.my',
        website: 'https://www.nanhwa.edu.my',
        facebook: 'https://www.facebook.com/nanhwahs',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1935,
        motto: '明德、格物、致知、笃行',
        language_env: '三语均衡发展，注重英语与马来语在实际生活与商科中的口语运用',
        summary: toBlock('实兆远南华独立中学创立于1935年，座落在霹雳州曼绒县实兆远与爱大华交界。学校致力于提供高素质的华文中等教育，结合现代教育技术与传统儒家品德。'),
        philosophy: toBlock('秉承“明德格物”的古训，致力于追求学术与实践的结合，培养诚实、勤奋并具有科学精神的新一代公民。'),
        education_features: toBlock('五星行政规范：行政管理系统健全高效，实行标准化评估，在北马地区拥有良好的社会信誉度。\n\n生活习惯培养：深度引入习惯重塑，教导学生建立自律的生活作息、责任感与感恩回馈习惯。\n\n多元升学通道：兼考统考与政府SPM文凭，商科教学深受地方雇主与高等私立院校的赞赏。'),
        curriculum: toBlock('初中主打三语基础与科学常识；高中部细分为理科、商科与文商科分流，数理化学科配套双语教材。'),
        facilities: toBlock('建有全冷气多媒体教室、大礼堂、理化生实验室、多功能图书室、学生冷气寄宿大楼及大草场。'),
        clubs: toBlock('拥有廿四节令鼓队、扯铃队、醒狮团、管乐与弦乐团、少青团、红新月会等三十多个社团。')
      },
      {
        name_zh: '班台育青中学',
        name_en: 'Yik Ching Secondary School',
        slug: 'yik-ching-pantai',
        state: 'Perak',
        city: 'Pantai Remis',
        address: 'Jalan Pantai, 34900 Pantai Remis, Perak',
        phone: '05-6771661',
        email: 'info@yikching.edu.my',
        website: 'https://www.yikching.edu.my',
        facebook: 'https://www.facebook.com/yikchingpantai',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1962,
        motto: '诚、正、力、行',
        language_env: '华语媒介为主，强调英文与国文写作与口语在社会实践中的实用性',
        summary: toBlock('班台育青中学创立于1962年，座落于美丽富饶的班台渔村。学校依靠地方华社的热心捐献与坚定维护，成为班台及周边地区培育英才的摇篮。'),
        philosophy: toBlock('秉持“诚正力行”校训，致力于为地方子女提供公平且优质的华文中等教育，协助各层次学子获得人生成功。'),
        education_features: toBlock('小而美精品学校：学校环境温馨优美，推行小班制关怀教学，教师能精细跟进每一位学生的成长与进度。\n\n与地方共荣共生：注重饮水思源，学校日常管理深深融入班台华社的热烈支持，感恩文化融入血液。\n\n双轨升学辅导：兼顾独中统考与SPM，提供针对性极强的商科大纲和基础数理讲授。'),
        curriculum: toBlock('初中注重学科基础通识与品格教育；高中细分为传统的文商科及实用商科课程，课时紧凑合理。'),
        facilities: toBlock('拥有高水准教学楼、多媒体教室、图书馆、物理化学实验室、羽球馆、男女生宿舍以及干净卫生的学生食堂。'),
        clubs: toBlock('开设学长团、红新月会、二十四节令鼓队、扯铃队、书法社、棋艺社等种类多样的兴趣学会。')
      },
      {
        name_zh: '江沙崇华独立中学',
        name_en: 'Tsung Wah Secondary School',
        slug: 'tsung-wah-kangsar',
        state: 'Perak',
        city: 'Kuala Kangsar',
        address: 'Lot 2366, Jalan Sultan Iskandar Shah, 33000 Kuala Kangsar, Perak',
        phone: '05-7762366',
        email: 'info@tsungwah.edu.my',
        website: 'https://www.tsungwah.edu.my',
        facebook: 'https://www.facebook.com/tsungwahprivate',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1911,
        motto: '敦品励学',
        language_env: '华语为主媒介，重视日常英马双语技能考核，营造温馨交交互融环境',
        summary: toBlock('江沙崇华独立中学前身为1911年创办的崇华学校，是皇家山城江沙唯一的华文独立中学。学校提倡“敦品励学”的学术风气。'),
        philosophy: toBlock('坚持以“德育为首，智育为主”为育人方向，致力于通过小班特色教育和关怀机制培养卓越人才。'),
        education_features: toBlock('精品名校方针：由于学校位于皇家山城，推行小班精细化和家庭式关怀，对每个孩子进行专属的心灵与学业辅导。\n\n传统文化根基：注重孝道感恩和中华节庆仪轨建设，使学生成为兼具道德担当与高雅品味的青年。\n\n统考与SPM兼备：高中部实施文理分流，数理基础打法扎实，支持高三毕业生报考全球一流大专院校。'),
        curriculum: toBlock('初中包括通识基础课、经典故事与心理辅导；高中设立理科与商科班。'),
        facilities: toBlock('建有优雅教学楼、现代化电脑室、物理实验室、化学实验室、男女生冷气学生宿舍。'),
        clubs: toBlock('设有廿四节令鼓队、扯铃社、醒狮团、管乐社、红新月会、圣约翰救伤队等多个联课社团。')
      },
      {
        name_zh: '钟灵独立中学',
        name_en: 'Chung Ling Private High School',
        slug: 'chung-ling-private',
        state: 'Pulau Pinang',
        city: 'George Town',
        address: 'Jalan Kampung Baru, 11400 Ayer Itam, Pulau Pinang',
        phone: '04-8282059',
        email: 'info@clphs.edu.my',
        website: 'https://www.clphs.edu.my',
        facebook: 'https://www.facebook.com/clphs',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1962,
        motto: '爱吾钟灵',
        language_env: '华文为主，重视英马双语技能考核，拥有突出的中英双语环境。',
        summary: toBlock('槟城钟灵独立中学创立于1962年，是全马最具名望和学术实力的顶级独中之一。学校以学术极其严谨、统考及SPM双轨制成绩斐然闻名全国。'),
        philosophy: toBlock('秉承“爱吾钟灵”的精神，注重塑造尊师重道的风气以及科学批判思维，致力于为马国培养具有高尚情操、扎实学问和健全人格的一流国民。'),
        education_features: toBlock('双轨制巅峰表现：学校强制推行独中统考（UEC）与国家SPM考试双轨道运行，历年统考特优生比例高居全马前三。\n\n深厚学术底蕴：作为钟灵三校之一，承载了百年的华社期望，校友网络遍布全球，为毕业生提供极其丰富的社会资源与升学奖学金。\n\n全方位素质拓展：除了卓越的学术表现，学校在机器人设计、戏剧演辩和二十四节令鼓等竞赛中屡获全国及国际金奖。'),
        curriculum: toBlock('初中实施三语及数理通识基础课；高中细分为理科、商科和文商科分流，针对性强化SPM及统考的核心科目。'),
        facilities: toBlock('配有冷气教学大楼、大礼堂、科学中心、多媒体图书资讯室、男女生冷气学生宿舍。'),
        clubs: toBlock('开设有机器人学会、管乐团、华乐团、圣约翰救伤队、少服团、武术团、扯铃队以及高水准的球类训练班。')
      },
      {
        name_zh: '韩江中学',
        name_en: 'Han Chiang High School',
        slug: 'han-chiang-private',
        state: 'Pulau Pinang',
        city: 'George Town',
        address: 'Lim Lean Teng Road, 11600 George Town, Pulau Pinang',
        phone: '04-2811521',
        email: 'info@hanchiang.edu.my',
        website: 'https://www.hanchiang.edu.my',
        facebook: 'https://www.facebook.com/hanchianhighschool',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1950,
        motto: '笃学问、敦品行',
        language_env: '华、英、马三语并重，首创独中多媒体信息化教学体系。',
        summary: toBlock('韩江中学创立于1950年，由已故华社领袖林连登先生创办。学校是全马首批实施电子信息化智能教学的“先锋独中”，极富现代化气息。'),
        philosophy: toBlock('继承孔子“有教无类”的教育理想，传授与弘扬华族优秀道德传统，创造本土色彩与华族文化交融的求学环境，推展全人素质教育。'),
        education_features: toBlock('智慧数字化校园：全校普及智慧电子白板教学，是全马第一家成功引入VR体验室和STEAM创客中心的独中，以科技驱动教学创新。\n\n多轨制英语课程：结合剑桥英语大纲精修，强化学生英语听说读写技能，为接轨国际顶尖大专做足充分铺垫。\n\n完善的传媒教育：得益于韩江传媒大学学院的同一体系资源，学校开设有特色多媒体与新闻摄影课程，极富特色。'),
        curriculum: toBlock('初中打牢数理与三语基础；高中细分为传统的理科与文商科，同时开辟艺术设计与技职选修。'),
        facilities: toBlock('建有综合大楼，内设智慧电子教室、餐饮模拟厨房、美术工作室、大讲堂、联课活动中心及冷气化学生宿舍。'),
        clubs: toBlock('扯铃社、醒狮团、动漫社、餐饮学会、家政学会、二十四节令鼓队、合唱团、日本文化社等50多个联课团体。')
      },
      {
        name_zh: '日新独立中学',
        name_en: 'Jit Sin Independent High School',
        slug: 'jit-sin-private',
        state: 'Pulau Pinang',
        city: 'Bukit Mertajam',
        address: 'Jalan Kampung Baru, 14000 Bukit Mertajam, Pulau Pinang',
        phone: '04-5305063',
        email: 'info@jitsin-ind.edu.my',
        website: 'https://www.jitsin-ind.edu.my',
        facebook: 'https://www.facebook.com/jitsinind',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1918,
        motto: '敬、爱、勤、朴',
        language_env: '华语为核心，兼顾英马双语的高水准学术交流。',
        summary: toBlock('大山脚日新独立中学创立于1918年，是威省地区唯一的华文独立中学。学校在北马享有极其崇高的学术声誉，以统考成绩优异及高纪律作风名震华社。'),
        philosophy: toBlock('秉承“苟日新，日日新，又日新”的办学信念，坚持有教无类、因材施教，致力于为北马学子共建“温馨和谐、乐教爱学”的成长家园。'),
        education_features: toBlock('北马统考之冠：学校要求极高，学术严谨。历年高中和初中统考的及格率均逼近100%，大量毕业生被清华、北大、新国大等顶尖名校录取。\n\n严格纪律与生活教育：推行高度正规化的品德考核、孝道感恩和自理能力考核，宿舍作息及内务整理严苛，磨砺出高自律青年。\n\n卓越联课成就：学校设立有近60个高水平联课社团，管乐团、民乐团及演辩社等在全马中学生竞赛中常年名列前茅。'),
        curriculum: toBlock('核心教学紧扣独中统考大纲并考取国家SPM文凭，数理科全面导入双语教学。'),
        facilities: toBlock('建有全冷气课室、现代化图书馆、多功能球场、物理化学实验室、华乐室、舞蹈排练厅以及高标准男女生寄宿大楼。'),
        clubs: toBlock('开设醒狮团、管乐团、二十四节令鼓队、演辩社、机器人学会、武术团、圣约翰救伤队等近50个极具活力与创意的社团。')
      },
      {
        name_zh: '槟华女子独立中学',
        name_en: 'Penang Chinese Girls\' Private High School',
        slug: 'penang-chinese-girls-private',
        state: 'Pulau Pinang',
        city: 'George Town',
        address: '2, Jalan Gottlieb, 10350 George Town, Pulau Pinang',
        phone: '04-2263072',
        email: 'info@pcghs.edu.my',
        website: 'https://www.pcghs.edu.my',
        facebook: 'https://www.facebook.com/pcghsprivate',
        school_type: 'Girls',
        has_hostel: true,
        established_year: 1919,
        motto: '庄、诚、勤、朴',
        language_env: '华文核心，三语兼优，注重培养女性高尚品格与领导力。',
        summary: toBlock('槟华女子独立中学创立于1919年，是马来西亚唯一的全女生华文独立中学。学校融汇传统女性美德与现代女子独立精神，教育成果显著。'),
        philosophy: toBlock('传承“庄诚勤朴”的校训，实施德、智、体、群、美五育并重之女校特色教育，旨在培育优雅、坚韧、兼具母语传统与国际眼界的新女性。'),
        education_features: toBlock('全马唯一女校独中特色：专注于女生的心理成长、形体礼仪及独立自治技能培养，定制有女童军、优雅家政等专属项目。\n\n中英双语顶尖平衡：得益于卓越的师资力量，英语环境非常优越，高频举行国际学术研讨，雅思考试及格率极佳。\n\n全人关怀体系：倡导小班制温馨女校氛围，师生良性沟通，着力于排除青春期焦虑，建立女生的核心自信。'),
        curriculum: toBlock('初中包括通识基础课、经典教育与辅导课；高中分为理科与文商科分流，在物理、化学、高数等教学中深度融入双语辅助大纲。'),
        facilities: toBlock('建有全冷气化教学楼、理化生实验室、多媒体微格课室、藏书量极大的图书馆、高水准联课活动中心及冷气女生宿舍。'),
        clubs: toBlock('拥有超过40个特色女校社团，包括著名的弦乐团、合唱团、红新月会、书法学会、家政学会等多个社团。')
      },
      {
        name_zh: '菩提独立中学',
        name_en: 'Phor Tay Private High School',
        slug: 'phor-tay-private',
        state: 'Pulau Pinang',
        city: 'George Town',
        address: '19-A, Jalan Bagan Jermal, 10250 George Town, Pulau Pinang',
        phone: '04-2271465',
        email: 'info@phortay.edu.my',
        website: 'https://www.phortay.edu.my',
        facebook: 'https://www.facebook.com/phortayprivate',
        school_type: 'Coed',
        has_hostel: false,
        established_year: 1940,
        motto: '仁、慎、勤、毅',
        language_env: '华文为主，融汇佛教慈悲精神与现代科学，注重心智关怀。',
        summary: toBlock('菩提独立中学创立于1940年，是全马第一所亦是唯一一所佛教背景的华文独立中学。学校提倡孝敬感恩、博爱大慈的校风，专注发展人文素质教育。'),
        philosophy: toBlock('以佛教八正道为行事指南，实施“仁慎勤毅”之修养教育。不仅传授文化知识，更着重净化心灵与健全人格的修行。'),
        education_features: toBlock('大慈悲心智修养：全校强制设立静坐、佛学基础理论课以及生命教育，引导学生在高度浮躁的现代社会中学会自我调节、正念专注。\n\n小班精品化关怀：教师对学生倾注极高正向心理辅导，倡导无边界沟通，特别适合期望个性成长和心理关怀的学子。\n\n与社区紧密交融：学校常年组织地方慈善服务、义工营及环保实践，帮助学生在志愿活动中学会奉献与感恩。'),
        curriculum: toBlock('以独中统考大纲及KSSM国家标准大纲为轴心，采用初高中的双轨融合机制，紧密衔接独中统考（UEC）与国家SPM大纲。'),
        facilities: toBlock('拥有禅堂、大礼堂、科学中心、多媒体图书资讯室、理化生实验室及优雅的小草场。'),
        clubs: toBlock('开设有佛教青年会、二十四节令鼓队、扯铃社、书法学会、红新月会、管乐团等联课社团。')
      },
      {
        name_zh: '新山宽柔中学',
        name_en: 'Foon Yew High School',
        slug: 'foon-yew-high-school',
        state: 'Johor',
        city: 'Johor Bahru',
        address: '59, Jalan Ibrahim Sultan, 80300 Johor Bahru, Johor',
        phone: '07-2224446',
        email: 'fyhs@foonyew.edu.my',
        website: 'https://www.foonyew.edu.my',
        facebook: 'https://www.facebook.com/foonyewjb',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1913,
        motto: '礼义廉耻',
        language_env: '以华语为主媒介语，兼顾英马双语，拥有庞大且底蕴深厚的学术与文化环境。',
        summary: toBlock('新山宽柔中学创立于1913年，是全马最大型的华文独立中学，被誉为“华社最高学府”之一。学校规模宏大，在南马教育界及全球校友网络中享有崇高学术声望。'),
        philosophy: toBlock('贯彻“礼义廉耻”校训，推行德、智、体、群、美五育并重之全人教育，培育具有高度母语文化自信、爱吾宽柔精神和国际竞争力的栋梁之才。'),
        education_features: toBlock('南马学术与文化重镇：学术严谨度极高，历年独中统考与国家SPM双轨成绩皆位居全国前列，是大批清华、北大、新国大等名校的摇篮。\n\n极其庞大的全球校友网：历经百年的办学历史沉淀，宽柔校友遍布世界政商学术界，为毕业生提供了无可比拟 of 校友奖学金和人脉支持。\n\n丰富多元的联课社团：拥有近80个高水平联课社团，学校的管乐团、弦乐团、演辩社及廿四节令鼓队常年荣获全国性奖项。'),
        curriculum: toBlock('初中实施全面数理与人文大纲；高中细分为理科、文商科以及特色电机、美工等技职课，全面接轨UEC统考与国家SPM文凭。'),
        facilities: toBlock('配备冷气教学大楼、大型综合图书馆、千人礼堂、多功能体育馆、科学探索中心、以及可容纳数百名住宿生的高标准学生宿舍。'),
        clubs: toBlock('二十四节令鼓队、管乐团、弦乐团、少服团、武术学会、机器人研究社、动漫社、红新月会、演辩社等。')
      },
      {
        name_zh: '宽柔中学古来分校',
        name_en: 'Foon Yew High School - Kulai',
        slug: 'foon-yew-kulai',
        state: 'Johor',
        city: 'Kulai',
        address: 'Lot 1591, Jalan Teratai, Bandar Indahpura, 81000 Kulai, Johor',
        phone: '07-6636479',
        email: 'fykl@foonyew.edu.my',
        website: 'https://www.fyk.edu.my',
        facebook: 'https://www.facebook.com/foonyewkulai',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 2005,
        motto: '礼义廉耻',
        language_env: '三语兼备，注重科技创新以及实践性技职教学。',
        summary: toBlock('宽柔中学古来分校于2005年正式启用，是一所极具现代化气息的大型分校。学校承袭了宽柔百年办学底蕴，同时在生态校园建设与特色技职教育上走出了一条创新之路。'),
        philosophy: toBlock('秉承“爱吾宽柔”的优良传统，积极推行现代素质教育，结合现代教育技术与人文生态关怀，致力打造“和谐、进取、创新”的生态智能校园。'),
        education_features: toBlock('首屈一指的餐饮与职教特色：学校特设高水平餐饮管理、电机工程、以及美术设计专业技职课程，建有模拟西餐厅和先进电工实验室。\n\n绿色生态智慧校园：占地广阔，绿化率极高，是将自然生态与数字化教学融合的典范，设有专门的生态园林供户外探究。\n\n优秀的双轨学术成绩：古来分校在维持高统考及格率的同时，SPM表现同样卓越，近年来数理科特优生比例大幅增长。'),
        curriculum: toBlock('普通学术班实施UEC统考和SPM双轨制；技职班专注于实践技能培训与大专衔接。'),
        facilities: toBlock('拥有先进的技职综合大楼、多媒体教室、宽敞 of 运动场、大型冷气礼堂以及设施齐备的男女生寄宿大楼。'),
        clubs: toBlock('餐饮学会、电机技术学会、扯铃社、二十四节令鼓队、华乐团、舞蹈团、跆拳道社、摄影学会等。')
      },
      {
        name_zh: '宽柔中学至达城分校',
        name_en: 'Foon Yew High School - Seri Alam',
        slug: 'foon-yew-seri-alam',
        state: 'Johor',
        city: 'Masai',
        address: 'Jalan Persiaran Seri Alam, Bandar Seri Alam, 81750 Masai, Johor',
        phone: '07-2133533',
        email: 'fysa@foonyew.edu.my',
        website: 'https://www.foonyewsa.edu.my',
        facebook: 'https://www.facebook.com/foonyewsa',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 2020,
        motto: '礼义廉耻',
        language_env: '华、英、马三语并重，以极高标准的多媒体数字化互动教学为主导。',
        summary: toBlock('宽柔中学至达城分校于2020年开课，是宽柔中学的第二所分校。学校作为全马最新的高起点规划独中之一，全面融汇智能数字化管理，是新一代智慧校园的杰出代表。'),
        philosophy: toBlock('以宽柔精神为核心，运用现代化科技辅助教学，构建数字化智能全人关怀体系，致力培育具备批判思维、终身学习习惯和科技伦理素养的数字时代青年。'),
        education_features: toBlock('全新高标准智慧校园：全校普及智慧电子白板与全无线覆盖教学环境，率先使用云端综合评价系统进行学生全面品行考核。\n\n极具前瞻性的STEAM课程：引入前沿的机器人、人工智能（AI）基础与创客编程课程，全方位锻炼学生的逻辑和设计思维。\n\n师资结构年轻且具活力：教师多具备现代化跨学科综合教学能力，倡导探究式与项目式学习（PBL）机制。'),
        curriculum: toBlock('初中重点落实三语及数理逻辑通识；高中在传统文理商科基础上注入数字化信息素养学时。'),
        facilities: toBlock('配置高规格科学探索实验室、多功能微格教室、室内体育馆、电子图书馆、以及现代公寓式男女生寄宿公寓。'),
        clubs: toBlock('机器人与创客社、数字传媒社、合唱团、二十四节令鼓、武术社、羽球学会、圣约翰救伤队等。')
      },
      {
        name_zh: '居銮中华中学',
        name_en: 'Chung Hwa High School Kluang',
        slug: 'chung-hwa-kluang',
        state: 'Johor',
        city: 'Kluang',
        address: 'Jalan Sekolah Chong Hwa, 86000 Kluang, Johor',
        phone: '07-7724021',
        email: 'chhs@chhs.edu.my',
        website: 'https://www.chhs.edu.my',
        facebook: 'https://www.facebook.com/chhskluang',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1918,
        motto: '礼义廉耻',
        language_env: '以华语为核心的教学体系，重视英马双语沟通，具有强烈的华文文化传承风气。',
        summary: toBlock('居銮中华中学创立于1918年，是柔佛中部规模最宏大的百年华文独立中学。学校在北马和南马之间架起了坚实的人才桥梁，以深厚的人文底蕴和卓越的技职、美术课程闻名遐迩。'),
        philosophy: toBlock('秉持“学行并重，五育均衡”的方针，坚持“百年树人”之社会担当，致力于提供平民化且高质量的中等教育，为国家社会培育具有诚信和创造力的公民。'),
        education_features: toBlock('名震华社的美术与技职教育：学校开办的美术设计以及电机工程班在南马享有盛誉，毕业生作品在全国独中美术展中屡获金奖。\n\n极具凝聚力的万人大集会：作为山城居銮的文化地标，学校每次的校庆募款与文艺晚会皆获得全镇居民倾力支持，社区粘性冠绝全马。\n\n高度自律的庞大寄宿生管理：宿舍历史悠久，实施高度军事化与温情相结合的管理，极大地培养了寄宿生的独立自理和团队协作能力。'),
        curriculum: toBlock('核心教学紧扣独中统考大纲并考取国家SPM文凭；技职班提供国家职业技能认证（SKM）双认证大纲。'),
        facilities: toBlock('建有全冷气多功能礼堂、美术大楼、电机工程实习工厂、现代体育馆、多媒体资讯中心、以及能容纳上千人的大型寄宿楼。'),
        clubs: toBlock('美术学会、廿四节令鼓队、华乐团、管乐社、红新月会、圣约翰救伤队、扯铃学会、吉他社、日本文化社等。')
      },
      {
        name_zh: '麻坡中化中学',
        name_en: 'Chung Hwa High School Muar',
        slug: 'chung-hwa-muar',
        state: 'Johor',
        city: 'Muar',
        address: 'Jalan Junid, 84000 Muar, Johor',
        phone: '07-9511211',
        email: 'info@chhsmuar.edu.my',
        website: 'https://www.chhsmuar.edu.my',
        facebook: 'https://www.facebook.com/chhsmuar',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1912,
        motto: '礼义廉耻 / 忠、信、笃、敬',
        language_env: '华语核心，注重母语文学素养与跨文化沟通，拥有极其优雅的中英双语人文氛围。',
        summary: toBlock('麻坡中化中学创立于1912年，是马来西亚历史最悠久的百年独立中学之一，坐落在人文荟萃的皇城麻坡。学校在文史哲教育、数理基础、以及美育方面成果优异，是南马著名的人才重镇。'),
        philosophy: toBlock('以弘扬中华传统文化为己任，秉承“忠信笃敬”的做人原则与“礼义廉耻”的立身标准，致力于发掘每个学生的特长，促使其在充满人文关怀的环境中全面成长。'),
        education_features: toBlock('深厚悠远的文史底蕴：学校的文学创作和华文教育享誉全国，历代校友中作家、学者辈出，校园弥漫着浓厚的文艺创作气息。\n\n卓越的数理学术成绩：数学与自然科学教学水平优越，学生在历届全国中学生数理科竞赛中常年名列前茅，大批毕业生保送中台名校。\n\n环保绿色校园：全面推行绿色低碳校园策略，禁止一次性餐具，倡导垃圾分类与有机校园种植，培养生态道德公民。'),
        curriculum: toBlock('初中包括通识基础课与文史教育；高中细分为理科、文商科及美术科，全面备战独中统考与SPM考试。'),
        facilities: toBlock('配置有现代化图书馆、冷气大礼堂、标准塑胶跑道体育场、高标准多媒体教室、科学实验中心、以及冷气寄宿大楼。'),
        clubs: toBlock('华乐团、管乐社、戏剧学会、二十四节令鼓、演辩社、环保学会、电脑机器人学会、漫画社、少林武术学会等。')
      },
      {
        name_zh: '峇株吧辖华仁中学',
        name_en: 'Batu Pahat Chinese High School',
        slug: 'chhs-batu-pahat',
        state: 'Johor',
        city: 'Batu Pahat',
        address: 'Jalan Tanjong Laboh, 83000 Batu Pahat, Johor',
        phone: '07-4341186',
        email: 'info@chhs.edu.my',
        website: 'https://www.chhsbp.edu.my',
        facebook: 'https://www.facebook.com/chhsbp',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1940,
        motto: '礼义廉耻',
        language_env: '华文为主导，兼顾英马双语，校园崇尚自然、学术与艺术探索的融合。',
        summary: toBlock('峇株吧辖华仁中学创立于1940年，被誉为“伏龙山下的摇篮”，在全马华社享有极高的美育与人文声誉。学校强调“人文化成”的教育理想，注重开发学生的艺术天赋与多元智能。'),
        philosophy: toBlock('以“成人成才”为育人目标，秉承“人本关怀”与“环境美育”之教学方针，坚持让学生在优美的大自然中健康生活、快乐求知，努力培育具有高度同理心和审美情操的一流青年。'),
        education_features: toBlock('全国独中“艺术家的摇篮”：美育在华中占有极重分量，学校拥有极其突出的美术设计系，走出了一大批活跃于全球的知名艺术家、设计师与演艺界人士。\n\n伏龙山下的自然生态美育：校园依山而建，环境清幽雅致，学校积极开展野外植物辨识与鸟类探究课程，将生态环保化为校园基因。\n\n全方位心理咨询与生涯辅导：是全马独中里最早建立专业辅导机制的学校之一，提供极其健全的学生生涯规划、职业评测和心理辅导。'),
        curriculum: toBlock('核心教学涵盖文、理、商科大纲，注重双轨制备考，提供丰富的社会实践与研学选修学时。'),
        facilities: toBlock('配备冷气教学大楼、艺术展示长廊、多媒体微格课室、藏书量庞大的经典图书馆、以及环境优雅的冷气寄宿大楼。'),
        clubs: toBlock('美术学会、戏剧社、华乐团、管乐社、二十四节令鼓、演辩学会、红新月会、自然学会、吉他社、日本文化学会等。')
      },
      {
        name_zh: '新文龙中华中学',
        name_en: 'Chung Hwa High School Rengit',
        slug: 'chung-hwa-rengit',
        state: 'Johor',
        city: 'Rengit',
        address: 'Jalan Rengit, 83100 Rengit, Batu Pahat, Johor',
        phone: '07-4241148',
        email: 'sbrchhs@foonyew.edu.my',
        website: 'https://www.chhsrengit.edu.my',
        facebook: 'https://www.facebook.com/chhsrengit',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1957,
        motto: '礼义廉耻',
        language_env: '华语教学为本，三语重视日常考核，注重关怀与个性成长。',
        summary: toBlock('新文龙中华中学创立于1957年，位于峇株巴辖南部龙引镇（Rengit），是一所深受当地渔农社会热爱并合力支撑的半郊区精品独中。学校推行小班精致化教育，对每一位学子实施极具温情的个性化辅导。'),
        philosophy: toBlock('贯彻平民教育理想，秉承“有教无类、因材施教”的信念，致力于通过低师生比和高频家庭关怀，为半郊区学子建立自信，促使其学业、品德齐头并进。'),
        education_features: toBlock('小班精品化个性关怀：师生关系极为紧密融洽，老师对每位学生倾注极高专职心理辅导，特别适合需要定制化学习和关爱环境的学子。\n\n特色生态农业与实践课程：得益于龙引镇的生态农业背景，学校开设了有机耕作、现代园艺以及地方生态微探究等趣味课程，实用性极强。\n\n丰厚的地方社会助学基金：由当地龙引、新加兰、文律三地华社倾力扶持，为贫寒及外地寄宿生提供极其优厚的奖助学金，生活负担极低。'),
        curriculum: toBlock('以独中统考大纲为轴心，辅以SPM基础大纲辅导，针对性开展应用文书及基础商业学技能培训。'),
        facilities: toBlock('拥有温雅教学楼、电脑实习室、理化实验室、生态农耕园地、多媒体资讯中心以及男女生冷气宿舍。'),
        clubs: toBlock('廿四节令鼓队、扯铃社、醒狮团、红新月会、书法学会、合唱团、园艺学会、电脑组等多个特色社团。')
      },
      {
        name_zh: '永平中学',
        name_en: 'Yong Peng High School',
        slug: 'yong-peng-high-school',
        state: 'Johor',
        city: 'Yong Peng',
        address: 'Jalan Sekolah, 83700 Yong Peng, Johor',
        phone: '07-4671611',
        email: 'info@yphs.edu.my',
        website: 'https://yphs.edu.my',
        facebook: 'https://www.facebook.com/yphs1957',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1957,
        motto: '礼义廉耻',
        language_env: '华文为主导，兼顾英马双语，积极推行高频英语对话考核及国际视野项目。',
        summary: toBlock('永平中学创立于1957年，是柔北著名的精品独立中学。近年来，学校引入了全新的现代化董事会与国际教育专家团队，积极推进教学数字化升级、国际合作以及英语强化学程，展现出极强的进取活力。'),
        philosophy: toBlock('秉持“礼义廉耻”立身根本，融入现代全球化视野，推行“德智体群美劳”六育均衡之全人教学，致力于将永中打造为兼具母语根基和国际竞争力的现代名校。'),
        education_features: toBlock('国际化双轨强力转型：引入先进教育管理系统，与台湾、中国以及新加坡大专院校建立高频校际保送协议，外语强化学术表现优异。\n\n别墅式住宿社区：自2020年起，学校创新租用高档别墅群并改造成高品质寄宿小区，提供空调自习室及专车接送，住宿环境极佳。\n\n卓越的创新与创客实验课：在初中部推行跨学科STEAM与机器人编程实操课，强化逻辑推导、团队合作和动手设计能力。'),
        curriculum: toBlock('核心教学涵盖统考与SPM双轨道大纲，初中全面必修STEAM创客编程，高中开设特色商科选修大纲。'),
        facilities: toBlock('拥有先进的创客中心、冷气综合大楼、高标准图书馆、多功能操场、以及高标准别墅式男女生宿舍。'),
        clubs: toBlock('二十四节令鼓队、机器人研究社、扯铃队、华乐社、红新月会、排球社、摄影组、家政学会等。')
      },
      {
        name_zh: '笨珍培群独立中学',
        name_en: 'Pei Chun High School',
        slug: 'pei-chun-pontian',
        state: 'Johor',
        city: 'Pontian',
        address: 'Jalan Sekolah, 82000 Pontian, Johor',
        phone: '07-6868268',
        email: 'peichun@pc.edu.my',
        website: 'https://peichunbp.edu.my',
        facebook: 'https://www.facebook.com/peichunhighschool',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1922,
        motto: '礼义廉耻',
        language_env: '华文为主，重视三语实用能力考核，民风淳朴，文化传承扎实。',
        summary: toBlock('笨珍培群独立中学创立于1922年，是临近柔佛西海岸笨珍县的百年华文名校。学校承载了笨珍几代华社的殷切期盼，秉持着高水平纪律与质朴求实的办学风气，培育了数以万计的人才。'),
        philosophy: toBlock('以“平民化、扎实化、全人化”为办学精髓，落实“学思并重”之启发式教学，注重锤炼学生坚韧不拔的意志与高尚的道德品德。'),
        education_features: toBlock('百年质朴卓越风气：校风高度严谨规范，对学生的日常纪律、品格以及考勤实施严格监控，培养出高度诚信自律的社会青年。\n\n突出的跨学科演辩成就：演辩社、文学学会实力极其雄厚，常年在全国独中辩论及文学创作大赛中问鼎三甲。\n\n红树林生态环境考察：学校地处沿海，充分利用红树林和湿地自然景观，经常开展跨学科科学野外实地探究活动。'),
        curriculum: toBlock('初中包括通识基础课与科学实操课；高中分设理科与商科班，全面衔接独中统考与SPM考试大纲。'),
        facilities: toBlock('建有全冷气多功能礼堂、多媒体语音室、标准理化实验室、红树林生态室、现代化图书馆、以及男女生冷气学生宿舍。'),
        clubs: toBlock('廿四节令鼓队、演辩社、红新月会、管乐团、武术学会、戏剧社、吉他组、华乐学会等多个充满活力的社团。')
      },
      {
        name_zh: '利丰港培华独立中学',
        name_en: 'Pei Hwa High School',
        slug: 'pei-hwa-ledang',
        state: 'Johor',
        city: 'Sungai Mati',
        address: 'Jalan Sungai Mati, 84400 Sungai Mati, Tangkak, Johor',
        phone: '06-9751037',
        email: 'phhs@peihwahs.edu.my',
        website: 'https://www.peihwahs.edu.my',
        facebook: 'https://www.facebook.com/peihwaledang',
        school_type: 'Coed',
        has_hostel: true,
        established_year: 1929,
        motto: '礼义廉耻',
        language_env: '华语教学为核心，重视中英马三语在实际生活和日常学习中的平衡应用。',
        summary: toBlock('利丰港培华独立中学创立于1929年，坐落在柔北麻河畔的利丰港小镇。学校是一所充满温馨家庭感和浓厚学术气息的精品独中，致力于为市郊学子营造安全、积极、和谐的求学乐园。'),
        philosophy: toBlock('以“成德达才”为办学理念，倡导家庭式关怀与互助精神，重视因材施教和小班制教学，全心发掘学生的潜在潜质，促使其德智体美全面均衡发展。'),
        education_features: toBlock('温馨家庭式教育生态：低师生比，班主任及学科老师与学生宛如家人，高频开展日常与学业辅导，辅导机制完善。\n\n特色环境科学课：结合学校及地方自然资源，推行绿色校园设计和基础土壤、水质环保探究课，知行合一。\n\n实用多轨大纲：学校在保障独中统考核心数理优势的同时，特设实用的商业文书、会计学强化大纲，使毕业生具备极强的就业大专衔接竞争力。'),
        curriculum: toBlock('初中包括通识基础课与电脑操作；高中细分为传统的理科与商科班，全面接轨UEC统考与国家SPM文凭。'),
        facilities: toBlock('建有温雅冷气教学楼、电子电脑实习室、标准科学实验中心、环境优雅的操场、以及高性价比男女生寄宿大楼。'),
        clubs: toBlock('二十四节令鼓队、管乐团、醒狮团、红新月会、摄影组、电脑编程学会、环保研究社、吉他学会等。')
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

    // 9. 怡保培南中学 (Poi Lam Ipoh) 关联数据
    const plDocId = createdSchools['poi-lam-ipoh']?.documentId;
    if (plDocId) {
      console.log('Seeding REAL Poi Lam Ipoh relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: plDocId, fee_year: 2025, registration_fee: 500, tuition_fee: 4500, misc_fee: 250, total_yearly: 4750 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: plDocId, male_hostel: true, female_hostel: true, room_type: '四人房与六人房（提供冷气与风扇选项）', monthly_fee: 550 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: plDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-31', exam_date: '2025-10-18', eligibility: toBlock('初一招考：参加入学考试或以小学评估（UASA/TP）保送。招收国际学生并协助办理学生签证，无本地监护人者必须入住学校宿舍。') },
        status: 'published'
      });
    }

    // 10. 怡保深斋中学 (Shen Jai Ipoh) 关联数据
    const sjDocId = createdSchools['shen-jai-ipoh']?.documentId;
    if (sjDocId) {
      console.log('Seeding REAL Shen Jai relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: sjDocId, fee_year: 2025, registration_fee: 300, tuition_fee: 3600, misc_fee: 200, total_yearly: 4100 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: sjDocId, male_hostel: true, female_hostel: true, room_type: '常规多人套房(带风扇/冷气)', monthly_fee: 450 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: sjDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-15', exam_date: '2025-10-11', eligibility: toBlock('初一招考：华、国、英、数四科参加入学考试；或以小五及小六校内成绩优良保送。') },
        status: 'published'
      });
    }

    // 11. 怡保育才中学 (Yuk Choy Ipoh) 关联数据
    const ycDocId = createdSchools['yuk-choy-ipoh']?.documentId;
    if (ycDocId) {
      console.log('Seeding REAL Yuk Choy relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: ycDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 3200, misc_fee: 150, total_yearly: 3550 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: ycDocId, male_hostel: true, female_hostel: true, room_type: '四至六人标准房', monthly_fee: 400 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: ycDocId, intake_year: 2026, application_start: '2025-06-15', application_end: '2025-11-10', exam_date: '2025-10-25', eligibility: toBlock('招考初一新生；提供保送免试录取（全科TP达4级或总平均70分以上）。') },
        status: 'published'
      });
    }

    // 12. 太平华联独中 (Hua Lian Taiping) 关联数据
    const hlDocId = createdSchools['hua-lian-taiping']?.documentId;
    if (hlDocId) {
      console.log('Seeding REAL Hua Lian relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: hlDocId, fee_year: 2025, registration_fee: 250, tuition_fee: 3100, misc_fee: 180, total_yearly: 3530 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: hlDocId, male_hostel: true, female_hostel: true, room_type: '常规四至八人间', monthly_fee: 380 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: hlDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-31', exam_date: '2025-10-12', eligibility: toBlock('华小六年级学生；成绩优秀者可免试直升，其余需参加入学考。') },
        status: 'published'
      });
    }

    // 13. 安顺三民独中 (San Min Teluk Intan) 关联数据
    const smDocId = createdSchools['san-min-teluk-intan']?.documentId;
    if (smDocId) {
      console.log('Seeding REAL San Min relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: smDocId, fee_year: 2025, registration_fee: 350, tuition_fee: 3500, misc_fee: 220, total_yearly: 4070 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: smDocId, male_hostel: true, female_hostel: true, room_type: '男女生寄宿房型选项', monthly_fee: 460 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: smDocId, intake_year: 2026, application_start: '2025-06-10', application_end: '2025-10-20', exam_date: '2025-10-19', eligibility: toBlock('提供统考班与剑桥英语大纲考试。参加入学考试或优等免试。') },
        status: 'published'
      });
    }

    // 14. 金宝培元独中 (Pei Yuan Kampar) 关联数据
    const pyDocId = createdSchools['pei-yuan-kampar']?.documentId;
    if (pyDocId) {
      console.log('Seeding REAL Pei Yuan relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: pyDocId, fee_year: 2025, registration_fee: 150, tuition_fee: 2900, misc_fee: 120, total_yearly: 3170 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: pyDocId, male_hostel: true, female_hostel: true, room_type: '冷气套房多人寝室', monthly_fee: 420 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: pyDocId, intake_year: 2026, application_start: '2025-07-01', application_end: '2025-11-15', exam_date: '2025-10-26', eligibility: toBlock('初一新生注册：UASA/TP成绩优良免试，或参加数理英华入学测试。') },
        status: 'published'
      });
    }

    // 15. 实兆远南华独中 (Nan Hwa Sitiawan) 关联数据
    const nhDocId = createdSchools['nan-hwa-sitiawan']?.documentId;
    if (nhDocId) {
      console.log('Seeding REAL Nan Hwa relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: nhDocId, fee_year: 2025, registration_fee: 300, tuition_fee: 3400, misc_fee: 200, total_yearly: 3900 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: nhDocId, male_hostel: true, female_hostel: true, room_type: '新建男女生宿（六至八人房）', monthly_fee: 450 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: nhDocId, intake_year: 2026, application_start: '2025-05-25', application_end: '2025-09-30', exam_date: '2025-10-05', eligibility: toBlock('参加入学公开考试，或以小五全年评估五科TP23分以上免试保送。') },
        status: 'published'
      });
    }

    // 16. 班台育青中学 (Yik Ching Pantai) 关联数据
    const ycptDocId = createdSchools['yik-ching-pantai']?.documentId;
    if (ycptDocId) {
      console.log('Seeding REAL Yik Ching relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: ycptDocId, fee_year: 2025, registration_fee: 100, tuition_fee: 2400, misc_fee: 100, total_yearly: 2600 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: ycptDocId, male_hostel: true, female_hostel: true, room_type: '基础标准学生宿舍', monthly_fee: 350 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: ycptDocId, intake_year: 2026, application_start: '2025-06-15', application_end: '2025-11-20', eligibility: toBlock('小班精品化录取：以华小六年级成绩及日常操行评估，额满即止，免收部分注册费。') },
        status: 'published'
      });
    }

    // 17. 江沙崇华独中 (Tsung Wah Kangsar) 关联数据
    const twDocId = createdSchools['tsung-wah-kangsar']?.documentId;
    if (twDocId) {
      console.log('Seeding REAL Tsung Wah relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: twDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 2800, misc_fee: 150, total_yearly: 3150 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: twDocId, male_hostel: true, female_hostel: true, room_type: '公寓式冷气男女宿舍', monthly_fee: 400 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: twDocId, intake_year: 2026, application_start: '2025-06-02', application_end: '2025-10-15', exam_date: '2025-10-11', eligibility: toBlock('小班制招录；华小平均分达60分或TP达20分以上直升，其余学生需参加小班面试。') },
        status: 'published'
      });
    }

    // 18. 钟灵独立中学 (Chung Ling Private) 关联数据
    const clDocId = createdSchools['chung-ling-private']?.documentId;
    if (clDocId) {
      console.log('Seeding REAL Chung Ling Private relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: clDocId, fee_year: 2025, registration_fee: 500, tuition_fee: 6500, misc_fee: 300, total_yearly: 6800 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: clDocId, male_hostel: true, female_hostel: true, room_type: '双人间及四人间(冷气套房)', monthly_fee: 650 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: clDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-15', exam_date: '2025-10-18', eligibility: toBlock('华小六年级学生；成绩优异或TP达25分以上免试保送，其余需参加入学考。招收国际学生并提供签证辅导。') },
        status: 'published'
      });
    }

    // 19. 韩江中学 (Han Chiang Private) 关联数据
    const hcDocId = createdSchools['han-chiang-private']?.documentId;
    if (hcDocId) {
      console.log('Seeding REAL Han Chiang relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: hcDocId, fee_year: 2025, registration_fee: 400, tuition_fee: 5500, misc_fee: 250, total_yearly: 5750 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: hcDocId, male_hostel: true, female_hostel: true, room_type: '四至六人冷气房寝室', monthly_fee: 580 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: hcDocId, intake_year: 2026, application_start: '2025-06-15', application_end: '2025-10-31', exam_date: '2025-10-25', eligibility: toBlock('初一新生：UASA/TP五大科TP值总和24分以上可免试。提供VR多媒体教学系统面试体验。') },
        status: 'published'
      });
    }

    // 20. 日新独立中学 (Jit Sin Private) 关联数据
    const jsDocId = createdSchools['jit-sin-private']?.documentId;
    if (jsDocId) {
      console.log('Seeding REAL Jit Sin relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: jsDocId, fee_year: 2025, registration_fee: 300, tuition_fee: 4800, misc_fee: 200, total_yearly: 5000 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: jsDocId, male_hostel: true, female_hostel: true, room_type: '新建学生公寓大楼标准多人间', monthly_fee: 500 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: jsDocId, intake_year: 2026, application_start: '2025-06-10', application_end: '2025-10-10', exam_date: '2025-10-19', eligibility: toBlock('招收初一新生：全科TP5或总平均达75分以上免试录取，其余需参加入学公开招录考核。') },
        status: 'published'
      });
    }

    // 21. 槟华女子独立中学 (Penang Chinese Girls Private) 关联数据
    const pcDocId = createdSchools['penang-chinese-girls-private']?.documentId;
    if (pcDocId) {
      console.log('Seeding REAL Penang Chinese Girls relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: pcDocId, fee_year: 2025, registration_fee: 350, tuition_fee: 4600, misc_fee: 180, total_yearly: 4780 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: pcDocId, male_hostel: false, female_hostel: true, room_type: '冷气套房标准寝室(仅收女寄宿生)', monthly_fee: 520 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: pcDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-11-15', eligibility: toBlock('仅收女生。华小评估成绩优良或平均70分以上保送。提供独特的个人品格及家政技能测试。') },
        status: 'published'
      });
    }

    // 22. 菩提独立中学 (Phor Tay Private) 关联数据
    const ptDocId = createdSchools['phor-tay-private']?.documentId;
    if (ptDocId) {
      console.log('Seeding REAL Phor Tay relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: ptDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 3800, misc_fee: 150, total_yearly: 3950 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: ptDocId, intake_year: 2026, application_start: '2025-07-01', application_end: '2025-11-20', eligibility: toBlock('小班制招收初一新生：以华小六年级成绩及日常操行评估，不设入学考，注重日常品德关怀面试。') },
        status: 'published'
      });
    }

    // 23. 新山宽柔中学 (Foon Yew High School) 关联数据
    const fyDocId = createdSchools['foon-yew-high-school']?.documentId;
    if (fyDocId) {
      console.log('Seeding REAL Foon Yew High School relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: fyDocId, fee_year: 2025, registration_fee: 250, tuition_fee: 5800, misc_fee: 300, total_yearly: 6350 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: fyDocId, male_hostel: true, female_hostel: true, room_type: '四人标准套房', monthly_fee: 480 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: fyDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-09-10', exam_date: '2025-09-13', eligibility: toBlock('公开参加入学考试；全科成绩特优者可申请免试直升及宽柔基金奖学金。') },
        status: 'published'
      });
    }

    // 24. 宽柔中学古来分校 (Foon Yew Kulai) 关联数据
    const fyklDocId = createdSchools['foon-yew-kulai']?.documentId;
    if (fyklDocId) {
      console.log('Seeding REAL Foon Yew Kulai relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: fyklDocId, fee_year: 2025, registration_fee: 250, tuition_fee: 5800, misc_fee: 300, total_yearly: 6350 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: fyklDocId, male_hostel: true, female_hostel: true, room_type: '四至六人标准房', monthly_fee: 480 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: fyklDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-09-10', exam_date: '2025-09-13', eligibility: toBlock('公开招收初一新生参加入学考，特设餐饮与技职选修班报名面试考核。') },
        status: 'published'
      });
    }

    // 25. 宽柔中学至达城分校 (Foon Yew Seri Alam) 关联数据
    const fysaDocId = createdSchools['foon-yew-seri-alam']?.documentId;
    if (fysaDocId) {
      console.log('Seeding REAL Foon Yew Seri Alam relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: fysaDocId, fee_year: 2025, registration_fee: 250, tuition_fee: 6000, misc_fee: 350, total_yearly: 6600 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: fysaDocId, male_hostel: true, female_hostel: true, room_type: '现代公寓式寝室', monthly_fee: 500 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: fysaDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-09-10', exam_date: '2025-09-13', eligibility: toBlock('招收初一新生参加入学考；初中全面实施STEAM创客教育通识考核评估。') },
        status: 'published'
      });
    }

    // 26. 居銮中华中学 (Chung Hwa Kluang) 关联数据
    const chkldDocId = createdSchools['chung-hwa-kluang']?.documentId;
    if (chkldDocId) {
      console.log('Seeding REAL Chung Hwa Kluang relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chkldDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 4200, misc_fee: 250, total_yearly: 4650 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chkldDocId, male_hostel: true, female_hostel: true, room_type: '常规多人套房(风扇/冷气选项)', monthly_fee: 420 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chkldDocId, intake_year: 2026, application_start: '2025-06-10', application_end: '2025-10-15', exam_date: '2025-10-18', eligibility: toBlock('公开招考初一新生，设有美术、电机工程技职保送免试通道（学业与操行达标）。') },
        status: 'published'
      });
    }

    // 27. 麻坡中化中学 (Chung Hwa Muar) 关联数据
    const chmrDocId = createdSchools['chung-hwa-muar']?.documentId;
    if (chmrDocId) {
      console.log('Seeding REAL Chung Hwa Muar relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chmrDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 4500, misc_fee: 250, total_yearly: 4950 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chmrDocId, male_hostel: true, female_hostel: true, room_type: '四至六人标准房', monthly_fee: 450 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chmrDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-05', exam_date: '2025-10-11', eligibility: toBlock('招录初一新生：参加入学考试；提供华小校长保送通道（操行甲等、全科TP5或以上）。') },
        status: 'published'
      });
    }

    // 28. 峇株吧辖华仁中学 (Batu Pahat Chinese High School) 关联数据
    const chbpDocId = createdSchools['chhs-batu-pahat']?.documentId;
    if (chbpDocId) {
      console.log('Seeding REAL Batu Pahat Chinese High School relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chbpDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 4300, misc_fee: 250, total_yearly: 4750 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chbpDocId, male_hostel: true, female_hostel: true, room_type: '山庄式常规多人套房', monthly_fee: 430 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chbpDocId, intake_year: 2026, application_start: '2025-06-15', application_end: '2025-10-10', exam_date: '2025-10-12', eligibility: toBlock('初一招考：参加入学统考；提供免试保送（在华小六年级学术表现排名前十者）。') },
        status: 'published'
      });
    }

    // 29. 新文龙中华中学 (Chung Hwa Rengit) 关联数据
    const chrgDocId = createdSchools['chung-hwa-rengit']?.documentId;
    if (chrgDocId) {
      console.log('Seeding REAL Chung Hwa Rengit relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: chrgDocId, fee_year: 2025, registration_fee: 100, tuition_fee: 3000, misc_fee: 150, total_yearly: 3250 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: chrgDocId, male_hostel: true, female_hostel: true, room_type: '标准四人房', monthly_fee: 380 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: chrgDocId, intake_year: 2026, application_start: '2025-07-01', application_end: '2025-11-20', eligibility: toBlock('小班精品录取：以六年级成绩操行免试注册，特设沿海三地（龙引、新加兰、文律）华社全额清寒奖学金通道。') },
        status: 'published'
      });
    }

    // 30. 永平中学 (Yong Peng High School) 关联数据
    const yphsDocId = createdSchools['yong-peng-high-school']?.documentId;
    if (yphsDocId) {
      console.log('Seeding REAL Yong Peng High School relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: yphsDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 3800, misc_fee: 200, total_yearly: 4200 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: yphsDocId, male_hostel: true, female_hostel: true, room_type: '高品质别墅式宿舍小区', monthly_fee: 380 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: yphsDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-31', exam_date: '2025-10-18', eligibility: toBlock('公开入学考试或校长保送。提供多元化的外语强化学术学额与优秀新生助学金申请。') },
        status: 'published'
      });
    }

    // 31. 笨珍培群独立中学 (Pei Chun Pontian) 关联数据
    const pcpDocId = createdSchools['pei-chun-pontian']?.documentId;
    if (pcpDocId) {
      console.log('Seeding REAL Pei Chun Pontian relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: pcpDocId, fee_year: 2025, registration_fee: 200, tuition_fee: 3900, misc_fee: 200, total_yearly: 4300 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: pcpDocId, male_hostel: true, female_hostel: true, room_type: '标准四人风扇房(可选冷气)', monthly_fee: 400 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: pcpDocId, intake_year: 2026, application_start: '2025-06-01', application_end: '2025-10-10', exam_date: '2025-10-11', eligibility: toBlock('招考初一新生：华语、国语、英语、数学四科参加入学公开考，操行甲等免试优先。') },
        status: 'published'
      });
    }

    // 32. 利丰港培华独立中学 (Pei Hwa Ledang) 关联数据
    const phldDocId = createdSchools['pei-hwa-ledang']?.documentId;
    if (phldDocId) {
      console.log('Seeding REAL Pei Hwa Ledang relations...');
      await strapi.documents('api::school-fee.school-fee').create({
        data: { school: phldDocId, fee_year: 2025, registration_fee: 150, tuition_fee: 3200, misc_fee: 200, total_yearly: 3550 },
        status: 'published'
      });
      await strapi.documents('api::hostel.hostel').create({
        data: { school: phldDocId, male_hostel: true, female_hostel: true, room_type: '经济四至八人房', monthly_fee: 350 },
        status: 'published'
      });
      await strapi.documents('api::admission.admission').create({
        data: { school: phldDocId, intake_year: 2026, application_start: '2025-06-15', application_end: '2025-11-15', eligibility: toBlock('精品化招收初一新生：不设重度入学考，注重日常品德关怀面试及华小校长推荐信评估录取。') },
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
      { slug: 'chung-hua-klang', juniorPass: 93.1, seniorPass: 91.2, localUni: 55, taiwan: 25, china: 11, singapore: 4, other: 5 },
      { slug: 'poi-lam-ipoh', juniorPass: 94.2, seniorPass: 92.5, localUni: 42, taiwan: 28, china: 10, singapore: 12, other: 8 },
      { slug: 'shen-jai-ipoh', juniorPass: 93.5, seniorPass: 91.8, localUni: 48, taiwan: 25, china: 11, singapore: 6, other: 10 },
      { slug: 'yuk-choy-ipoh', juniorPass: 92.8, seniorPass: 91.2, localUni: 50, taiwan: 26, china: 12, singapore: 4, other: 8 },
      { slug: 'hua-lian-taiping', juniorPass: 93.2, seniorPass: 91.6, localUni: 52, taiwan: 24, china: 10, singapore: 6, other: 8 },
      { slug: 'san-min-teluk-intan', juniorPass: 92.5, seniorPass: 90.8, localUni: 54, taiwan: 22, china: 12, singapore: 4, other: 8 },
      { slug: 'pei-yuan-kampar', juniorPass: 91.9, seniorPass: 90.1, localUni: 56, taiwan: 20, china: 11, singapore: 5, other: 8 },
      { slug: 'nan-hwa-sitiawan', juniorPass: 93.1, seniorPass: 91.4, localUni: 51, taiwan: 25, china: 12, singapore: 5, other: 7 },
      { slug: 'yik-ching-pantai', juniorPass: 90.8, seniorPass: 89.2, localUni: 58, taiwan: 22, china: 8, singapore: 4, other: 8 },
      { slug: 'tsung-wah-kangsar', juniorPass: 91.2, seniorPass: 89.8, localUni: 55, taiwan: 24, china: 9, singapore: 4, other: 8 },
      { slug: 'chung-ling-private', juniorPass: 98.2, seniorPass: 96.9, localUni: 35, taiwan: 22, china: 20, singapore: 15, other: 8 },
      { slug: 'han-chiang-private', juniorPass: 95.8, seniorPass: 94.2, localUni: 42, taiwan: 24, china: 15, singapore: 11, other: 8 },
      { slug: 'jit-sin-private', juniorPass: 97.5, seniorPass: 96.1, localUni: 40, taiwan: 25, china: 16, singapore: 12, other: 7 },
      { slug: 'penang-chinese-girls-private', juniorPass: 96.1, seniorPass: 94.8, localUni: 38, taiwan: 26, china: 14, singapore: 14, other: 8 },
      { slug: 'phor-tay-private', juniorPass: 92.1, seniorPass: 90.5, localUni: 50, taiwan: 25, china: 10, singapore: 8, other: 7 },
      { slug: 'foon-yew-high-school', juniorPass: 98.7, seniorPass: 97.5, localUni: 35, taiwan: 22, china: 18, singapore: 20, other: 5 },
      { slug: 'foon-yew-kulai', juniorPass: 97.9, seniorPass: 96.8, localUni: 38, taiwan: 24, china: 16, singapore: 16, other: 6 },
      { slug: 'foon-yew-seri-alam', juniorPass: 97.2, seniorPass: 96.0, localUni: 40, taiwan: 22, china: 15, singapore: 18, other: 5 },
      { slug: 'chung-hwa-kluang', juniorPass: 96.5, seniorPass: 95.2, localUni: 42, taiwan: 28, china: 16, singapore: 9, other: 5 },
      { slug: 'chung-hwa-muar', juniorPass: 96.2, seniorPass: 95.0, localUni: 45, taiwan: 26, china: 15, singapore: 8, other: 6 },
      { slug: 'chhs-batu-pahat', juniorPass: 95.8, seniorPass: 94.6, localUni: 46, taiwan: 27, china: 13, singapore: 8, other: 6 },
      { slug: 'chung-hwa-rengit', juniorPass: 91.5, seniorPass: 89.9, localUni: 58, taiwan: 22, china: 10, singapore: 4, other: 6 },
      { slug: 'yong-peng-high-school', juniorPass: 93.2, seniorPass: 91.8, localUni: 50, taiwan: 24, china: 12, singapore: 8, other: 6 },
      { slug: 'pei-chun-pontian', juniorPass: 94.8, seniorPass: 93.5, localUni: 48, taiwan: 25, china: 14, singapore: 7, other: 6 },
      { slug: 'pei-hwa-ledang', juniorPass: 92.2, seniorPass: 90.6, localUni: 55, taiwan: 22, china: 12, singapore: 5, other: 6 }
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
