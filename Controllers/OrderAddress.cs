using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class OrderAddress
	{
		[JsonPropertyName("address")]
		public string Address { get; set; }

		[JsonPropertyName("lat")]
		public decimal Lat { get; set; }

		[JsonPropertyName("lon")]
		public decimal Lon { get; set; }
	}
}