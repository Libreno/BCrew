using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class SearchCrewResponse {
		public int Code { get; set; }
		public string Descr { get; set; }
		public SearchResultData Data {get;set;}
	}

	public class SearchResultData
	{
		[JsonPropertyName("crews_info")]
		public CrewsInfo[] CrewsInfo { get; set; }
	}

	public class CrewsInfo
	{
		[JsonPropertyName("crew_id")]
		public int CrewId { get; set; }

		[JsonPropertyName("car_mark")]
		public string CarMark { get; set; }

		[JsonPropertyName("car_model")]
		public string CarModel { get; set; }

		[JsonPropertyName("car_color")]
		public string CarColor { get; set; }

		[JsonPropertyName("car_number")]
		public string CarNumber { get; set; }

		// todo
		public string DriverName { get; set; }
		public string DriverPhone { get; set; }
		public decimal Lat { get; set; }
		public decimal Lon { get; set; }
		public int Distance { get; set; }
	}
}