import Fastify from "fastify";
import axios from "axios";
import cheerio from "cheerio";

const fastify = Fastify({
  logger: true,
});

fastify.get("/college/:id", async function handler(request: any, reply) {
  if (!request.params.id) {
    reply.send("Id is required");
    return;
  }

  const res = await axios.get(
    `https://nces.ed.gov/collegenavigator/?id=${request.params.id}`
  );

  const html = cheerio.load(res.data);
  const totalFee = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl00 > .tabconstraint > table.tabular > tbody > tr.level1indent:nth-child(20) > td:nth-child(5)`
  ).text();
  const accpetanceRate = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl04 > .tabconstraint > table.tabular > tbody > tr:nth-child(2) > td:nth-child(2)`
  ).text();
  const SATRequired = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl04 > .tabconstraint > table.tabular:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(2)`
  ).text();
  const SATOptional = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl04 > .tabconstraint > table.tabular:nth-child(5) > tbody > tr:nth-child(1) > td:nth-child(3)`
  ).text();
  const GPARequired = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl04 > .tabconstraint > table.tabular:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(2)`
  ).text();
  const GPAOptional = html(
    `#divctl00_cphCollegeNavBody_ucInstitutionMain_ctl04 > .tabconstraint > table.tabular:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(3)`
  ).text();

  const SAT =
    SATRequired === "X"
      ? "Required"
      : SATOptional === "X"
      ? "Optional (not required but considered)"
      : "Blind (not considered)";

  const GPA =
    GPARequired === "X"
      ? "Required"
      : GPAOptional === "X"
      ? "Optional (not required but considered)"
      : "Blind (not considered)";

  reply.send({
    total_fee: totalFee,
    accpetance_rate: `${accpetanceRate.split("%")[0]}%`,
    sat_required: SAT,
    gpa_required: GPA,
  });
});

// Run the server!
fastify.listen({ port: 4000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
