const cheerio = require("cheerio");
const superagent = require("superagent");

module.exports = {
	process: async message => {
		let { text: body } = await superagent
			.get(`https://www.google.com/search?q=${encodeURIComponent(message.args[0])}&hl=en`);
		let $ = cheerio.load(body); // eslint-disable-line id-length

		let resultmsg = "";
		let results = $(".g .r a");
		if(!results.length) return __("commands.default.google.noResults", message);

		let dictionary = $("#ires ol").children().eq(0).has("table").eq(0);
		if(dictionary.length) {
			resultmsg += `\n\n**${__("phrases.dictionary", message)}**`;

			let [word, pronunciation] = dictionary.find(".r").eq(0).find("div span")
				.map((index, element) => $(element).text()).get();

			let tableData = dictionary.find("table tbody").eq(0).find("tr td");
			resultmsg += `\n${word} (${pronunciation})`;
			for(let i = 0; i < tableData.length; i++) {
				let partOfSpeech = tableData.eq(i).find("div").text();
				resultmsg += `\n_${partOfSpeech}_`;

				let definitions = tableData.eq(i).find("ol li").eq(0).text();
				definitions.forEach((index, definition) => resultmsg += `\n\n**${index}**.  ${definition}`);
			}
		}

		let translate = $(".g div table.ts tbody tr td h3.r");
		if(translate.length) {
			resultmsg += `\n\n**${__("phrases.translation", message)}**`;

			let [input, output] = translate.find("span").map((index, element) => $(element).text()).get();
			resultmsg += `\n${input} => ${output}`;
		}

		let calculator = $("#topstuff ._tLi tbody tr td").eq(3).find("span.nobr h2.r");
		if(calculator.length) resultmsg += `\n\n**${__("phrases.calculator", message)}**\n${calculator.text()}`;

		let infoCard = $("#rhs_block ol .g");
		if(infoCard.length) {
			resultmsg += `\n\n**${__("phrases.infoCard", message)}**\n${calculator.text()}`;

			let title = infoCard.find("._o0d div ._B5d").text();
			let info = infoCard.find("._o0d div ._zdb._Pxg").text();
			let description = infoCard.find("._o0d ._tXc span").clone().children().remove().end().text();

			if(info) resultmsg += `\n${title} (${info})\n${description}`;
			else resultmsg += `\n${title}\n${description}`;
		}

		let stories = $("#ires ol").children().eq(2).find("table.ts tbody td").eq(1).children();
		if(stories.length) {
			resultmsg += `\n\n**${__("phrases.stories", message)}**\n${calculator.text()}`;

			for(let i = 0; i < stories.length; i++) {
				let ele = stories.eq(i).find("a");
				let link = ele.attr("href");
				let storyName = ele.text();

				if(!link) continue;
				else if(~link.indexOf("/url?q=")) link = link.substring(link.indexOf("/url?q=") + 7, link.indexOf("&sa="));
				if(i) link = `<${link}>`;
				resultmsg += `\n${storyName}\n_${link}`;
			}
		}

		resultmsg += `\n\n**${__("phrases.searchResults", message)}**`;
		for(let i = 0; i < 3; i++) {
			let ele = results.eq(i);

			let link = ele.attr("href");
			if(!link) continue;
			else if(~link.indexOf("/url?q=")) link = link.substring(link.indexOf("/url?q=") + 7, link.indexOf("&sa="));


			if(i) link = `<${link}>`;
			resultmsg += `\n${link}`;
		}

		return resultmsg;
	},
	description: "Search google for a query",
	aliases: ["g"],
	args: [{
		type: "text",
		label: "query"
	}]
};
