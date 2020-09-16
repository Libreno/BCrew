using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class SearchCrewRequest
	{
		[JsonPropertyName("source_time")]
		public string SourceTime { get; set; }

		[JsonPropertyName("addresses")]
		public SearchCrewAddress[] Address {get;set;}
	}

	public class SearchCrewAddress
	{
		[JsonPropertyName("address")]
		public string Address { get; set; }

		[JsonPropertyName("lat")]
		public decimal Lat { get; set; }

		[JsonPropertyName("lon")]
		public decimal Lon { get; set; }
	}
}