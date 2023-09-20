import axios from "axios";
import cheerio from "cheerio";

async function routes(fastify, options) {
  fastify.get("/:id", async function handler(request, reply) {
    if (!request.params.id) {
      reply.send("Id is required");
      return;
    }

    const res = await axios.get(
      `https://nces.ed.gov/collegenavigator/?id=${request.params.id}`
    );

    const html = cheerio.load(res.data);
    const name = html(
      ".dashboard > .collegedash > div > span > .headerlg"
    ).text();
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
      이름: name,
      등록금: totalFee.replace(",", ""),
      합격률: `${accpetanceRate.split("%")[0]}%`,
      SAT_필수여부: SAT,
      GPA_필수여부: GPA,
    });
  });
}

export default routes;
