using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class OrderCrewRequest
	{
		[JsonPropertyName("source_time")]
		public string SourceTime {get;set;}

		public OrderAddress[] Addresses { get; set; }

		[JsonPropertyName("crew_id")]
		public int CrewId { get; set; }
	}
}