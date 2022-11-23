import { AllCollectionsResponse, connectToDatabase } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import AxiosDigest from 'axios-digest';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
import { v4 as uuidv4 } from 'uuid';

import { Collection } from 'mongodb';
import { randomItemFromArray } from './utils/randomItemFromArray';
import {
  AllEntities,
  IndexableProperties,
  IndexedTargetArray,
  IndexedTargetArrayItem,
} from './@types/indexableProperties';
import dayjs from 'dayjs';
import axios from 'axios';

const numberOfBatches = 100;
const applicantsPerBatch = randomNumberInclusive(10, 3000);
const orgsToCreate = randomNumberInclusive(33, 33);
const publicKey = 'rzlsbipz'; // TODO delete lol
const privateKey = '612c8dfe-b160-4c68-958d-d5116fc02aea'; // TODO delete lol
const dbName = 'development';

// Fidning them in the UI
// var findElements = function(tag, text) {
//   var elements = document.getElementsByTagName(tag);
//   var found = [];
//   for (var i = 0; i < elements.length; i++) {
//     if (elements[i].innerHTML.includes(text) ) {
//       found.push(elements[i]);
//     }
//   }
//   return found;
// }
// let elements = findElements('a', 'Index')

// orgsInDB = elements.map((item) => item.outerText)

// https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc
const weightedRandom = (items: string[], weights: number[]) => {
  // Preparing the cumulative weights array.
  // For example:
  // - weights = [1, 4, 3]
  // - cumulativeWeights = [1, 5, 8]
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  // Getting the random number in a range of [0...sum(weights)]
  // For example:
  // - weights = [1, 4, 3]
  // - maxCumulativeWeight = 8
  // - range for the random number is [0...8]
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // Picking the random item based on its weight.
  // The items with higher weight will be picked more often.
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return items[itemIndex];
    }
  }
};

const main = async () => {
  try {
    const { client, collections } = await connectToDatabase({ databaseName: dbName });

    let processedApplicants = 0;

    console.log(`Updating applicants with id`);

    console.log('Updating IDS Set!');
    const allOrgs = [];
    const orgWeights = [];
    Array.from({ length: orgsToCreate }).forEach(() => {
      allOrgs.push(
        faker.company
          .companyName()
          .toLowerCase()
          .replaceAll(/[^a-z]/gi, ''),
      );
    });
    const topOrgs = [
      'bahringerwalshandprohaskaIndex',
      'ritchielemkeandharveyIndex',
      'reingermacejkovicIndex',
      'maggioincIndex',
      'cormiermohrIndex',
      'halvorsonschmittIndex',
      'champlinhuelIndex',
      'steuberandsonsIndex',
      'dickimarvinIndex',
      'gradycummerataandbaileyIndex',
      'naderpredovicandmarquardtIndex',
      'ferryokeefeIndex',
      'treutelandsonsIndex',
      'boscollcIndex',
      'wolffhellerIndex',
      'macgyverlueilwitzandhickleIndex',
      'larsonpfefferIndex',
      'lakinabernathyIndex',
      'balistrerifraneyIndex',
      'oconnellllcIndex',
      'littelwintheiserandrutherfordIndex',
      'priceincIndex',
      'vonornandschaeferIndex',
      'grahamrutherfordandcrooksIndex',
      'murraycollinsandlabadieIndex',
      'stantongroupIndex',
      'leuschkegaylordIndex',
      'glovervonruedenandmayerIndex',
      'rempelgroupIndex',
      'spinkagroupIndex',
      'schustercassinandhansenIndex',
      'corkeryincIndex',
      'wisozkreingerandjacobsonIndex',
      'turcottegroupIndex',
      'trompharveyanddenesikIndex',
      'legrosreichelIndex',
      'lockmangroupIndex',
      'murazikwalterIndex',
      'wymanoharaandwittingIndex',
      'metzbraunandtorpIndex',
      'mcdermottandsonsIndex',
      'sawaynreichelandschinnerIndex',
      'coletorpIndex',
      'kleinbergstromIndex',
      'keelingcronaIndex',
      'robelllcIndex',
      'heaneygroupIndex',
      'kovacekkiehnandmrazIndex',
      'schadenwillmsIndex',
    ];
    // Unique only
    // let orgs = [...new Set(allOrgs)];
    let orgs = [
      ...topOrgs,
      'muellermullerandrunteIndex',
      'considineboehmIndex',
      'damorestammanddachIndex',
      'thielquitzonIndex',
      'nienowkozeyandhickleIndex',
      'darejacobsIndex',
      'muellerllcIndex',
      'botsfordincIndex',
      'jaskolskiandsonsIndex',
      'mosciskillcIndex',
      'altenwerthgroupIndex',
      'coleandsonsIndex',
      'weimannschulistandmillsIndex',
      'smithmorissetteandferryIndex',
      'bodebergeIndex',
      'wehnerschillerIndex',
      'shanahanincIndex',
      'greenholtandsonsIndex',
      'framipfefferIndex',
      'hagenesjonesIndex',
      'rolfsonllcIndex',
      'murazikdonnellyandmertzIndex',
      'hettingerllcIndex',
      'homenickllcIndex',
      'pagacaltenwerthIndex',
      'kautzerhammesIndex',
      'yostwuckertIndex',
      'bogisichcartwrightandgaylordIndex',
      'okonquigleyIndex',
      'heathcotehilpertandspinkaIndex',
      'kuhnoberbrunnerandkoeppIndex',
      'padbergbartonandwaelchiIndex',
      'schinnergroupIndex',
      'skilesmckenzieandgreenholtIndex',
      'feeneyzulaufIndex',
      'towneullrichandmrazIndex',
      'strackelittelIndex',
      'bashiriangroupIndex',
      'auerhermistonIndex',
      'herzogschmelerIndex',
      'krisincIndex',
      'adamsferryIndex',
      'wintheisermannIndex',
      'okonlittleIndex',
      'naderoberbrunnerandkulasIndex',
      'donnellyandsonsIndex',
      'brekkegrantandmoenIndex',
      'morarrunteIndex',
      'beahankossIndex',
      'caspermayerIndex',
      'bergstromhagenesandhartmannIndex',
      'carrollandsonsIndex',
      'littlewillIndex',
      'olsoncristIndex',
      'moenryanandryanIndex',
      'muellerhagenesandbaumbachIndex',
      'larsongroupIndex',
      'greenholtvolkmanIndex',
      'waelchireillyandhilllIndex',
      'gleasonandsonsIndex',
      'skilespacochaIndex',
      'borerincIndex',
      'mcclureincIndex',
      'nikolausbergeIndex',
      'swaniawskibogisichIndex',
      'brueneffertzandrennerIndex',
      'jerdeandsonsIndex',
      'schmidtllcIndex',
      'mannwolffandkautzerIndex',
      'lehnerwardandgislasonIndex',
      'robellednerandwardIndex',
      'breitenberggroupIndex',
      'romagueraandsonsIndex',
      'schinnerandsonsIndex',
      'kirlinprohaskaIndex',
      'robelkautzerIndex',
      'luettgenmacejkovicandweberIndex',
      'kingandsonsIndex',
      'ankundingandsonsIndex',
      'jacobsongroupIndex',
      'mrazquitzonandheathcoteIndex',
      'terrygroupIndex',
      'mrazaltenwerthIndex',
      'oberbrunnerarmstronganddachIndex',
      'stiedemanntrantowandbalistreriIndex',
      'wisozkllcIndex',
      'tremblayvonruedenIndex',
      'mcglynnincIndex',
      'jakubowskinolanIndex',
      'oharamedhurstIndex',
      'beerbalistreriandmuellerIndex',
      'murraycollinsandlabadieIndex',
      'connellybednarIndex',
      'treutelrunolfsdottirandschummIndex',
      'gutkowskiincIndex',
      'mckenziegroupIndex',
      'morissetteincIndex',
      'prosaccodareIndex',
      'abshireboscoandbeerIndex',
      'koelpintillmanIndex',
      'keelingandsonsIndex',
      'moorestantonandloweIndex',
      'kunzemullerIndex',
      'rogahnmillsIndex',
      'mullerincIndex',
      'keelingosinskiandgoyetteIndex',
      'cormierharrisandschambergerIndex',
      'ondrickashanahanIndex',
      'hodkiewiczincIndex',
      'starkandsonsIndex',
      'kuhlmanincIndex',
      'zboncakabbottandstrosinIndex',
      'bednarswiftIndex',
      'dooleyllcIndex',
      'cartwrightratkeIndex',
      'okonwisokyIndex',
      'grahamrutherfordandcrooksIndex',
      'heaneyincIndex',
      'nicolasmannIndex',
      'hellerllcIndex',
      'kemmerrohanIndex',
      'hegmannraynorandtoyIndex',
      'bayerrempelIndex',
      'walterkrisandkonopelskiIndex',
      'yundttreutelIndex',
      'bergstromwatersIndex',
      'weimanndubuqueandveumIndex',
      'wymanincIndex',
      'feeneyaufderharandstreichIndex',
      'mannparisiananddurganIndex',
      'gleichnerandsonsIndex',
      'farrelldareIndex',
      'monahanvonruedenandjohnstonIndex',
      'harveyllcIndex',
      'schadendenesikIndex',
      'beattyincIndex',
      'hesselllcIndex',
      'pfefferrippinIndex',
      'kunzecreminIndex',
      'barrowspagacandschulistIndex',
      'stammschoenandconnIndex',
      'wittinggroupIndex',
      'beermurrayIndex',
      'raynorincIndex',
      'uptonbergnaumandokunevaIndex',
      'watsicatorpIndex',
      'wizagroupIndex',
      'grahamheidenreichIndex',
      'tremblayoreillyIndex',
      'rathnicolasIndex',
      'wehnerandsonsIndex',
      'vandervortincIndex',
      'wunschpfannerstillIndex',
      'danielvonruedenIndex',
      'bauchconnIndex',
      'millskeeblerandkreigerIndex',
      'baileygroupIndex',
      'jacobsontowneandmurazikIndex',
      'rutherfordllcIndex',
      'shieldskleinandschmidtIndex',
      'gusikowskillcIndex',
      'wintheiserhauckandlehnerIndex',
      'gorczanyrennerandfeilIndex',
      'schusterbashirianandrosenbaumIndex',
      'hahnincIndex',
      'osinskigroupIndex',
      'schroedergroupIndex',
      'volkmanblockIndex',
      'lebsackaufderharandwolfIndex',
      'marksllcIndex',
      'kreigercollierIndex',
      'johnshaagIndex',
      'schusterlangworthandrueckerIndex',
      'kassulkecollinsandschambergerIndex',
      'jakubowskikochIndex',
      'cronaincIndex',
      'schaefergroupIndex',
      'kingincIndex',
      'skilescrooksandvolkmanIndex',
      'kuhnschulistandbreitenbergIndex',
      'sanfordhillsIndex',
      'johnstongroupIndex',
      'ratkeauerandmetzIndex',
      'quigleybeckerandwizaIndex',
      'hoegerandsonsIndex',
      'jacobsschultzIndex',
      'abbottstrosinandkemmerIndex',
      'goldnerterryandspinkaIndex',
      'mitchellgroupIndex',
      'kubcarterandklockoIndex',
      'purdybeattyIndex',
      'thieltrantowIndex',
      'reillyboscoandlarkinIndex',
      'greenholtgroupIndex',
      'kozeyincIndex',
      'oconnelldubuqueandziemannIndex',
      'goldnerandsonsIndex',
      'yostrolfsonIndex',
      'bodelehnerIndex',
      'carrollbinsIndex',
      'sanfordllcIndex',
      'farrellgreenfelderIndex',
      'ortizarmstrongandwelchIndex',
      'lubowitzparisianIndex',
      'grimesmohrIndex',
      'pagacandsonsIndex',
      'macgyvertrompandmcglynnIndex',
      'braunllcIndex',
      'lakinschmittIndex',
      'turnerferryandsipesIndex',
      'cronagroupIndex',
      'beierjacobsonandjohnsonIndex',
      'corkerygroupIndex',
      'reingerincIndex',
      'fisherchamplinandgislasonIndex',
      'dickinsonkleinandschusterIndex',
      'bartellschaeferandhoweIndex',
      'spinkawalkerIndex',
      'colebaumbachIndex',
      'greenfeldermedhurstandsmithamIndex',
      'hayesterryIndex',
      'schmittgibsonIndex',
      'blockvandervortandfarrellIndex',
      'hauckmohrIndex',
      'nitzschethompsonIndex',
      'strackehermistonandzboncakIndex',
      'stiedemannschultzandbeattyIndex',
      'boehmgorczanyandhermanIndex',
      'lubowitzllcIndex',
      'ernserandsonsIndex',
      'goldnerspinkaIndex',
      'reichelschambergerandrathIndex',
      'mullerboscoIndex',
      'bergedeckowIndex',
      'hahndonnellyIndex',
      'prosaccohellerandpacochaIndex',
      'maggiocummingsandgutkowskiIndex',
      'mooreparisianandfaheyIndex',
      'kautzertrantowandtorpIndex',
      'heathcoteschinnerandabernathyIndex',
      'treutelgroupIndex',
      'hackettgroupIndex',
      'goyettedurganandcarrollIndex',
      'hettingerpadbergandziemannIndex',
      'feesttreutelandschulistIndex',
      'donnellyfraneyandblickIndex',
      'trantowllcIndex',
      'parisianblickandschillerIndex',
      'stoltenbergbeattyIndex',
      'schmelerllcIndex',
      'wisozkpadbergandheaneyIndex',
      'sawaynfisherIndex',
      'thompsonllcIndex',
      'vonruedenllcIndex',
      'buckridgebrownandschultzIndex',
      'blickgroupIndex',
      'hudsonllcIndex',
      'krajcikhermistonIndex',
      'mosciskibarrowsIndex',
      'macgyverdubuqueandbuckridgeIndex',
      'larkintrantowIndex',
      'dibbertgroupIndex',
      'conroypaucekandbergnaumIndex',
      'greenrennerIndex',
      'weimannbogisichandstammIndex',
      'wolffandsonsIndex',
      'harberllcIndex',
      'creminandsonsIndex',
      'jakubowskicollinsIndex',
      'swiftklockoandmurphyIndex',
      'cormierdickiIndex',
      'kiehnsimonisandboyleIndex',
      'langoshweberIndex',
      'lakinllcIndex',
      'braunnitzscheandboscoIndex',
      'hodkiewiczgutkowskiandkeeblerIndex',
      'koelpinbaumbachandgusikowskiIndex',
      'kirlinlueilwitzandhammesIndex',
      'schinnerdaughertyandrodriguezIndex',
      'blickmonahanandjaskolskiIndex',
      'wiegandincIndex',
      'murraywiegandandsatterfieldIndex',
      'rippindouglasandbartellIndex',
      'kuhicgroupIndex',
      'goyettecummingsanderdmanIndex',
      'wilkinsonharrisIndex',
      'wardbauchIndex',
      'huelskreigerandschimmelIndex',
      'okunevalindgrenIndex',
      'windlerokunevaIndex',
      'auerllcIndex',
      'sawaynrobertsandmckenzieIndex',
      'weimannkilbackIndex',
      'huelgroupIndex',
      'lefflergroupIndex',
      'doylecrooksandlittleIndex',
      'schultzwisozkandzboncakIndex',
      'hoppebaileyandschuppeIndex',
      'keelingbodeIndex',
      'wildermanmurazikandturcotteIndex',
      'smithllcIndex',
      'wehnerincIndex',
      'oreillylindgrenandmcglynnIndex',
      'shanahansawaynIndex',
      'larsonlubowitzandkuphalIndex',
      'purdygislasonandgibsonIndex',
      'mclaughlinandsonsIndex',
      'howeyundtIndex',
      'ernsergroupIndex',
      'hermistonmacgyverIndex',
      'feeneycronaandjacobsIndex',
      'prohaskagislasonandquigleyIndex',
      'grimesllcIndex',
      'mitchellmanteIndex',
      'kerluketremblayIndex',
      'quigleykuvalisIndex',
      'oconnellgibsonandkuhnIndex',
      'klockorathIndex',
      'ritchiellcIndex',
      'binsbuckridgeandtorphyIndex',
      'walshsengerandkulasIndex',
      'wardklingandblandaIndex',
      'quigleyconsidineIndex',
      'sawaynandsonsIndex',
      'aufderharziemeandcummingsIndex',
      'emmerichchamplinIndex',
      'greenandsonsIndex',
      'hansenstreichIndex',
      'gleasonincIndex',
      'kreigerbeattyIndex',
      'kesslerdenesikIndex',
      'kuhicjaskolskiandrohanIndex',
      'zulaufllcIndex',
      'zemlakstokesandlynchIndex',
      'hauckincIndex',
      'faheyllcIndex',
      'okeefemacejkovicandklingIndex',
      'rutherfordandsonsIndex',
      'willmshudsonandleannonIndex',
      'millergleichnerandolsonIndex',
      'bauchroweandrohanIndex',
      'reichellueilwitzandcollierIndex',
      'konopelskikshlerinIndex',
      'runolfsdottirandsonsIndex',
      'abshiretowneandstoltenbergIndex',
      'fisherhermannandbernierIndex',
      'gulgowskibeckerandwolfIndex',
      'rathkrisIndex',
      'treutelborerIndex',
      'beiermetzIndex',
      'gleasonlarkinandfriesenIndex',
      'crooksbergstromandlittelIndex',
      'breitenbergmoenandhoweIndex',
      'mclaughlingreenandhermistonIndex',
      'larkinandsonsIndex',
      'bradtkewelchandbergstromIndex',
      'robertsbayerandwhiteIndex',
      'gislasonboyleandkonopelskiIndex',
      'hicklechamplinIndex',
      'morarnitzscheIndex',
      'monahankautzerIndex',
      'spinkakochIndex',
      'weimannlegrosandcruickshankIndex',
      'mayercollinsandgoyetteIndex',
      'prohaskacoleIndex',
      'ziemekochandsteuberIndex',
      'pollichincIndex',
      'ritchiemurazikandhintzIndex',
      'metzwisokyandkuphalIndex',
      'schroedermacejkovicandmayertIndex',
      'wymanwehnerIndex',
      'kiehnparisianandschuppeIndex',
      'faybahringerIndex',
      'herzogmaggioIndex',
      'feestgroupIndex',
      'walshkihnIndex',
      'gutmannmaggioIndex',
      'wymangroupIndex',
      'waelchiandsonsIndex',
      'oreillyincIndex',
      'nitzschedietrichandwymanIndex',
      'abbottandsonsIndex',
      'reingergroupIndex',
      'lebsackschillerIndex',
      'schmidtgroupIndex',
      'borerandsonsIndex',
      'oreillyrempelIndex',
      'stehrllcIndex',
      'barrowsvolkmanIndex',
      'ornincIndex',
      'keelinglynchandgleasonIndex',
      'faytoyandjenkinsIndex',
      'cronahintzIndex',
      'millerdenesikandhamillIndex',
      'streichgroupIndex',
      'ortizandsonsIndex',
      'kerlukegroupIndex',
      'terryandsonsIndex',
      'herzogsauerIndex',
      'balistreriloweandstehrIndex',
      'franeckiprohaskaIndex',
      'heaneykshlerinandrathIndex',
      'feilllcIndex',
      'strackeincIndex',
      'dickensandsonsIndex',
      'rippinvonIndex',
      'jakubowskijohnstonIndex',
      'runolfsdottirincIndex',
      'bergnaumgoyetteIndex',
      'gradymertzIndex',
      'maggioandsonsIndex',
      'dachandsonsIndex',
      'carterrogahnIndex',
      'hilllgroupIndex',
      'ziemannllcIndex',
      'lueilwitzgutkowskiandschoenIndex',
      'kuhlmangroupIndex',
      'collinsgroupIndex',
      'gulgowskinitzscheIndex',
      'skileslockmanIndex',
      'legroslednerIndex',
      'stoltenbergconnandhauckIndex',
      'wildermanmonahananddurganIndex',
      'erdmankeelingandjaskolskiIndex',
      'larsonmorarIndex',
      'huelkohlerIndex',
      'simonismarquardtIndex',
      'konopelskifraneyIndex',
      'davisnitzscheIndex',
      'rueckerzboncakIndex',
      'halvorsonandsonsIndex',
      'mullerbeckerIndex',
      'ondrickaromagueraandklingIndex',
      'feeneyllcIndex',
      'legrosbrakusIndex',
      'schadenkshlerinandschummIndex',
      'bartellandsonsIndex',
      'schummkundeandgreenIndex',
      'raynorllcIndex',
      'bergegroupIndex',
      'wunschandsonsIndex',
      'schoennolanIndex',
      'wisozkblandaIndex',
      'boderathandboyerIndex',
      'wisozkandsonsIndex',
      'hodkiewiczgroupIndex',
      'lemkebergeandwalshIndex',
      'millsdonnellyandoconnerIndex',
      'schambergeremardandbraunIndex',
      'brekkefeilandspinkaIndex',
      'hanejacobiandgerlachIndex',
      'wehnerdouglasIndex',
      'hilpertincIndex',
      'kleinreingerIndex',
      'nolandouglasIndex',
      'kovacekandsonsIndex',
      'spencerandsonsIndex',
      'jakubowskikautzerIndex',
      'millerkleinIndex',
      'deckowgroupIndex',
      'pfefferhintzIndex',
      'auerincIndex',
    ];
    // console.log(
    //   `Creating ${orgs.length} ${
    //     orgs.length !== allOrgs.length
    //   } because there were some duplicates with faker`,
    // );
    orgs.forEach((org, idx) => {
      // TODO: Temporary for keeping distribution accurate
      // Power rule, top 30 users drive most of the traffic
      if (idx < 10) {
        orgWeights.push(randomNumberInclusive(150, 200));
      } else if (idx < 25) {
        orgWeights.push(randomNumberInclusive(50, 120));
      } else {
        orgWeights.push(randomNumberInclusive(1, 75));
      }
    });
    console.log(`ORGS`, orgs);
    console.log(`Weights`, orgWeights);

    const groupId = `62e72d3d7be6ee26f42c0ec7`;
    const clusterName = `Cluster0`;
    const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}/fts/indexes`;

    // !Note disabled ofr now
    // const digestAuth = new AxiosDigestAuth({
    //   username: publicKey,
    //   password: privateKey,
    // });
    // for await (const org of orgs) {
    //   const data = {
    //     name: `${org}Index`,
    //     collectionName: collections.Applicants.collectionName,
    //     database: dbName,
    //     mappings: {
    //       dynamic: false,
    //       fields: {
    //         [`${org}Data`]: {
    //           dynamic: true,
    //           type: 'document',
    //         },
    //       },
    //     },
    //   };

    //   console.log(`Creating search index for org ${org}`);
    //   try {
    //     await digestAuth.request({
    //       url,
    //       data,
    //       method: 'POST',
    //       headers: { Accept: 'application/json' },
    //     });
    //     console.log('Created!');
    //   } catch (error) {
    //     if (error.response.data.detail === 'Duplicate Index.') {
    //       console.log('Duplicate index for ', org);
    //     } else {
    //       console.error(`Error creating search index`, error);
    //     }
    //   }
    // }

    const openings = [
      {
        name: 'NYC',
        weight: 0.24,
      },
      {
        name: 'Miami',
        weight: 0.42,
      },
      {
        name: 'Chicago',
        weight: 0.69,
      },
      {
        name: 'Los Angeles',
        weight: 0.84,
      },
      {
        name: 'Toronto',
        weight: 0.92,
      },
      {
        name: 'Seattle',
        weight: 1,
      },
    ];

    const stages = [
      {
        name: 'Questionnaire',
        weight: 0.17,
      },
      {
        name: 'Interviewing',
        weight: 0.42,
      },
      {
        name: 'Rejected',
        weight: 0.95,
      },
      {
        name: 'Hired',
        weight: 1,
      },
    ];

    let applicantsToCreate: any = [];

    const orgDistribution = {}; // TODO this is broken
    for (let i = 0; i < numberOfBatches; i++) {
      const localBatch: any = [];

      for (let i = 0; i < applicantsPerBatch; i++) {
        const orgForApplicant = weightedRandom(orgs, orgWeights);

        if (orgForApplicant in orgDistribution) {
          orgDistribution[orgForApplicant].value = orgDistribution[orgForApplicant].value++;
        } else {
          orgDistribution[orgForApplicant] = {
            value: 1,
          };
        }
        const getOpening = () => {
          const num = Math.random();

          for (const opening of openings) {
            if (num < opening.weight) {
              // To make it unique
              return `${opening.name}-${orgForApplicant}`;
            }
          }
        };
        const openingForApplicant = getOpening();

        const getStage = () => {
          const num = Math.random();

          for (const stage of stages) {
            if (num < stage.weight) {
              // To make it unique
              return `${stage.name}-${openingForApplicant}-${orgForApplicant}`;
            }
          }
        };
        const stageForApplicant = getStage();
        const applicantId = nanoid(50);
        const app = {
          [`${orgForApplicant}type`]: 'Applicant',
          [`${orgForApplicant}music`]: faker.music.genre(),
          [`${orgForApplicant}isActive`]: Math.random() > 0.5,
          [`${orgForApplicant}balance`]: Math.random() * randomNumberInclusive(1, 10000),
          [`${orgForApplicant}picture`]: 'http://placehold.it/32x32',
          [`${orgForApplicant}age`]: randomNumberInclusive(10, 99),
          [`${orgForApplicant}eyeColor`]: faker.commerce.color(),
          [`${orgForApplicant}name`]: faker.name.findName(),
          [`${orgForApplicant}gender`]: faker.name.gender(true),
          [`${orgForApplicant}company`]: orgForApplicant,
          [`${orgForApplicant}email`]: faker.internet.email(),
          [`${orgForApplicant}phone`]: faker.phone.phoneNumber(),
          [`${orgForApplicant}address`]: faker.address.streetAddress(),
          [`${orgForApplicant}about`]: faker.lorem.sentences(randomNumberInclusive(3, 100)),
          [`${orgForApplicant}desc`]: faker.commerce.productDescription(),
          [`${orgForApplicant}id`]: applicantId,
          [`${orgForApplicant}description`]: faker.commerce.productDescription(),
          [`${orgForApplicant}adjective`]: faker.commerce.productAdjective(),
          [`${orgForApplicant}material`]: faker.commerce.productMaterial(),
          [`${orgForApplicant}noun`]: faker.hacker.noun(),
          [`${orgForApplicant}account`]: faker.finance.accountName(),
          [`${orgForApplicant}direction`]: faker.address.direction(),
          [`${orgForApplicant}city`]: faker.address.city(),
          [`${orgForApplicant}country`]: faker.address.country(),
          [`${orgForApplicant}latitude`]: faker.address.latitude(),
          [`${orgForApplicant}longitude`]: faker.address.longitude(),
          [`${orgForApplicant}createdAt`]: faker.date.between(
            dayjs().subtract(5, 'years').toDate(),
            dayjs().toDate(),
          ),
          [`${orgForApplicant}updatedAt`]: faker.date.between(
            dayjs().subtract(5, 'years').toDate(),
            dayjs().toDate(),
          ),
          [`${orgForApplicant}birthDate`]: faker.date.between(
            dayjs().subtract(80, 'years').toDate(),
            dayjs().subtract(17, 'years').toDate(),
          ),
          [`${orgForApplicant}tags`]: [
            'consectetur in esse consequat sunt labore amet consectetur',
            'adipisicing dolor fugiat do sint do proident ullamco',
            'nostrud aliquip cillum pariatur nisi exercitation velit dolor',
            'qui laborum cillum mollit ut duis non esse',
            'anim eu tempor enim excepteur laboris occaecat enim',
            'voluptate et esse do incididunt est irure velit',
            'anim deserunt dolor non veniam nulla labore veniam',
            'magna enim qui ut excepteur commodo veniam ex',
            'minim occaecat eiusmod quis eiusmod non sint consequat',
            'non reprehenderit dolore pariatur aliqua qui esse mollit',
            'tempor in quis pariatur laborum nulla fugiat voluptate',
            'incididunt nulla dolore nulla cillum fugiat sint aliqua',
            'est ad sint irure sit mollit aliqua anim',
            'amet ad ad dolor aliqua sunt aliqua ut',
            'irure sit do non et proident id in',
            'ea occaecat sunt qui aute commodo elit irure',
            'cupidatat ullamco sit sit elit do ex laborum',
            'minim magna consequat Lorem aliquip voluptate dolore adipisicing',
            'ut eiusmod ipsum id dolor minim laboris elit',
            'occaecat aute ipsum eiusmod magna tempor elit ut',
          ],
          [`${orgForApplicant}greeting`]: 'Hello, Nadia Santos! You have 10 unread messages.',
          [`${orgForApplicant}favoriteDbType`]: faker.database.type(),
          [`${orgForApplicant}orgId`]: orgForApplicant,
          [`${orgForApplicant}openingId`]: openingForApplicant,
          [`${orgForApplicant}stageId`]: stageForApplicant,
        };

        const newApplicant = {
          idx: i,
          id: uuidv4(),
          orgId: orgForApplicant,
          openingId: openingForApplicant,
          stageId: stageForApplicant,
          // TODO Unique search index will be created per org
          [`${orgForApplicant}Data`]: app,
        };
        localBatch.push(newApplicant);
      }
      applicantsToCreate.push(localBatch);
    }

    console.log(`Org distribution\n\n`, orgDistribution);
    const sendToMongo = async (collections: AllCollectionsResponse) => {
      for await (const batch of applicantsToCreate) {
        const bidx = applicantsToCreate.indexOf(batch) + 1;

        await collections.Applicants.insertMany(batch);

        processedApplicants += batch.length;
        console.log(
          `Done processing batch`,
          bidx,
          ` - ${batch.length} applicants - Total: ${processedApplicants} / ${
            numberOfBatches * applicantsPerBatch
          }`,
        );
      }
      console.log('Done!');
    };

    console.log('Sending to mongo');
    await sendToMongo(collections);
  } catch (error) {
    console.error(`error `, error);
  }
};

main();
