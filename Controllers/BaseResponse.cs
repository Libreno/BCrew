namespace BCrew.Controllers
{
	public abstract class BaseResponse<T> {
		public int Code { get; set; }
		public string Descr { get; set; }
		public T Data { get; set; }

	}
}