export default function Page({ params }: { params: { id: string } }) {
    return(
        <div style={{ height: '100vh', width: '100vw'}}>
            <h1>Graph Builder { params.id }</h1>
        </div>
    );
}