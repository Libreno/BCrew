using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BCrew.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class CrewOrderController : ControllerBase
	{
		private readonly ILogger<CrewOrderController> logger;

		public CrewOrderController(ILogger<CrewOrderController> logger)
		{
			this.logger = logger;
		}

		[HttpPost]
		public SearchCrewResponse Search(SearchCrewRequest request) {
			logger.LogInformation($"Search {JsonSerializer.Serialize(request)}");
			var rnd = new Random();
			var crewsInfoList = Enumerable.Range(1, rnd.Next(1, 5)).Aggregate(new List<CrewsInfo>(), (v, i) => 
			{
				var car = CarInfoRandomGenerator.Next();
				var dLat = rnd.Next(-20, 20);
				var dLon = rnd.Next(-20, 20);
				
				v.Add(new CrewsInfo()
				{
					CrewId = rnd.Next(100, 999),
					CarMark = car.Item1,
					CarModel = car.Item2,
					CarColor = car.Item3,
					CarNumber = car.Item4,
					Lat = request.Address[0].Lat + ((decimal)dLat) / 10000,
					Lon = request.Address[0].Lon + ((decimal)dLon) / 10000,
					Distance = (int)Math.Truncate(Math.Sqrt(dLat*dLat + dLon*dLon) * 10)
				});
				return v;
			});

			return new SearchCrewResponse()
			{
				Code = 0,
				Descr = "OK",
				Data = new SearchResultData()
				{
					CrewsInfo = crewsInfoList.OrderBy(ci => ci.Distance).ToArray()
				}
			};
		}
	}
}
