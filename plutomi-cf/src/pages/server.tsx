

export const runtime = 'experimental-edge';



const Test = ({ data: { message} } : any) => (
   <div>SSR Page - {message} s</div>
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




