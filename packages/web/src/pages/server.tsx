

export const runtime = 'experimental-edge';



const Test = ({ data } : any) => (
   <div>SSR Page - {data}</div>
);


export const getServerSideProps = async () => {
      const res  = await fetch("https://api.plutomi.com/ssr-page")

      const data = await res.text()
      return {
         props: {
            data
         }
      }


}
export default Test;
