

const Test = ({ data: { message} } : any) => (
   <div>SSR Page - {message} s</div>
);


export const getServerSideProps = async () => {
      const { data }: { data: { message: string } } = await fetch("https://api.plutomi.com/api/ssr").then(res => res.json());
      return {
         props: {
            data
         }
      }


}
export default Test;




