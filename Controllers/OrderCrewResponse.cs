using System.Text.Json.Serialization;

namespace BCrew.Controllers
{
	public class OrderCrewResponse: BaseResponse<OrderInfo>
	{
	}

	public class OrderInfo { 
		[JsonPropertyName("order_id")]
		public int OrderId { get; set; }
	}
}