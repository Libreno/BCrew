using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class SearchCrewRequest
	{
		[JsonPropertyName("source_time")]
		public string SourceTime { get; set; }

		[JsonPropertyName("addresses")]
		public OrderAddress[] Addresses {get;set;}
	}
}