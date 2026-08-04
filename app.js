const app = document.getElementById("app");

let usuarioActual = null;
let prestamos = [];
let cancelarEscuchaPrestamos = null;

let pagos = [];
let cancelarEscuchaPagos = null;

let configuracionMetricas = {
  totalInterest: 30,

  interestByFrequency: {
    daily: 1,
    weekly: 5,
    biweekly: 10,
    monthly: 15
  },

  levels: {
    level1: 5000,
    level2: 8000,
    level3: 10000,
    level4: 15000,
    level5: 20000,
    level6: 30000,
    level7: 50000
  }
};

const formatoDinero = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  minimumFractionDigits: 2
});


/*=====================================================
 UTILIDADES
=====================================================*/

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function ordenarPrestamos(lista) {
  return [...lista].sort(function (a, b) {
    const fechaA = a.createdAt?.toMillis
      ? a.createdAt.toMillis()
      : 0;

    const fechaB = b.createdAt?.toMillis
      ? b.createdAt.toMillis()
      : 0;

    return fechaB - fechaA;
  });
}


/*=====================================================
 LOGIN
=====================================================*/

function mostrarLogin() {
  app.innerHTML = `
    <section class="login-page">

      <div class="login-card">

        <div class="brand">
          <span>SolutionData</span>

          <h1>Control de préstamos</h1>

          <p>
            Inicia sesión para administrar préstamos,
            clientes, cobros y mensajeros.
          </p>
        </div>

        <form id="loginForm">

          <label>
            Correo electrónico

            <input
              type="email"
              id="email"
              placeholder="administrador@correo.com"
              autocomplete="email"
              required
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              id="password"
              placeholder="Escribe tu contraseña"
              autocomplete="current-password"
              required
            />
          </label>

          <p id="loginMessage" class="message"></p>

          <button type="submit" id="loginButton">
            Iniciar sesión
          </button>

        </form>

      </div>

    </section>
  `;

  const loginForm =
    document.getElementById("loginForm");

  const loginButton =
    document.getElementById("loginButton");

  const loginMessage =
    document.getElementById("loginMessage");


  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const email =
        document
          .getElementById("email")
          .value
          .trim();

      const password =
        document
          .getElementById("password")
          .value;

      loginButton.disabled = true;
      loginButton.textContent = "Entrando...";
      loginMessage.textContent = "";

      try {

        await auth.signInWithEmailAndPassword(
          email,
          password
        );

      }
      catch (error) {

        console.error(
          "Error iniciando sesión:",
          error
        );

        loginMessage.textContent =
          "Correo o contraseña incorrectos.";

      }
      finally {

        loginButton.disabled = false;
        loginButton.textContent =
          "Iniciar sesión";

      }

    }
  );
}


/*=====================================================
 DASHBOARD
=====================================================*/

function mostrarDashboard(usuario) {
  usuarioActual = usuario;

  app.innerHTML = `
    <div class="dashboard-layout">

      <aside class="sidebar">

        <div class="sidebar-brand">
          <strong>SolutionData</strong>
          <span>Préstamos y cobros</span>
        </div>

        <nav class="sidebar-menu">

          <button
            class="menu-button active"
            data-page="inicio"
          >
            <i data-lucide="house"></i>
            <span>Inicio</span>
          </button>

          <button
            class="menu-button"
            data-page="prestamos"
          >
            <i data-lucide="banknote"></i>
            <span>Préstamos</span>
          </button>

          <button
            class="menu-button"
            data-page="archivo"
          >
            <i data-lucide="archive"></i>
            <span>Archivo</span>
          </button>

          <button
            class="menu-button"
            data-page="metricas"
          >
            <i data-lucide="chart-column"></i>
            <span>Métricas</span>
          </button>

          <button
            class="menu-button"
            data-page="mensajeros"
          >
            <i data-lucide="users"></i>
            <span>Mensajeros</span>
          </button>

          <button
            class="menu-button"
            data-page="pagos"
          >
            <i data-lucide="wallet"></i>
            <span>Pagos</span>
          </button>

        </nav>

        <button
          id="logoutButton"
          class="logout-button"
        >
          <i data-lucide="log-out"></i>
          <span>Cerrar sesión</span>
        </button>

      </aside>

      <main class="main-content">

        <header class="topbar">

          <div>
            <span class="section-label">
              SolutionData
            </span>

            <h1 id="pageTitle">
              Inicio
            </h1>

            <p>
              ${escaparHTML(usuario.email)}
            </p>
          </div>

          <button
            id="newLoanButton"
            class="primary-button"
          >
            Nuevo préstamo
          </button>

        </header>

        <section id="pageContent"></section>

      </main>

    </div>


    <div
      id="loanModal"
      class="loan-modal hidden"
    >

      <section class="loan-modal-card">

        <div class="loan-modal-header">

          <div>
            <span class="section-label">
              Nuevo registro
            </span>

            <h2>Crear préstamo</h2>
          </div>

          <button
            id="closeLoanModal"
            class="close-modal-button"
            type="button"
          >
            ×
          </button>

        </div>

        <form id="loanForm">

          <div class="loan-form-grid">

            <label>
              Nombre del cliente

              <input
                type="text"
                id="clientName"
                placeholder="Nombre completo"
                required
              />
            </label>

            <label>
              Teléfono

              <input
                type="tel"
                id="clientPhone"
                placeholder="809-000-0000"
                required
              />
            </label>

            <label>
              Cédula

              <input
                type="text"
                id="clientId"
                placeholder="000-0000000-0"
              />
            </label>

            <label>
              Dirección

              <input
                type="text"
                id="clientAddress"
                placeholder="Dirección completa"
                required
              />
            </label>

            <label>
              Capital prestado

              <input
                type="number"
                id="capital"
                min="1"
                step="0.01"
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Interés total

              <input
                type="text"
                id="interest"
                value="30%"
                readonly
              />
            </label>

            <label>
              Duración automática

              <input
                type="text"
                id="installments"
                placeholder="Se calculará automáticamente"
                readonly
              />
            </label>

            <label>
              Frecuencia de cobro

              <select id="frequency" required>
                <option value="diario">
                  Diario
                </option>

                <option value="semanal">
                  Semanal
                </option>

                <option value="quincenal">
                  Quincenal
                </option>

                <option value="mensual">
                  Mensual
                </option>
              </select>
            </label>

            <label>
              Fecha de inicio

              <input
                type="date"
                id="startDate"
                required
              />
            </label>

            <label>
              Mensajero asignado

              <select id="collector" required>
                <option value="">
                  Cargando mensajero...
                </option>
              </select>
            </label>

          </div>

          <section class="loan-calculation">

            <div>
              <span>Total a cobrar</span>

              <strong id="totalPreview">
                RD$0.00
              </strong>
            </div>

            <div>
              <span>Monto por cuota</span>

              <strong id="installmentPreview">
                RD$0.00
              </strong>
            </div>

          </section>

          <p
            id="loanMessage"
            class="message"
          ></p>

          <div class="loan-form-actions">

            <button
              type="button"
              id="cancelLoanButton"
              class="secondary-button"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="saveLoanButton"
              class="primary-button"
            >
              Guardar préstamo
            </button>

          </div>

        </form>

      </section>

    </div>
  `;


  document
    .getElementById("logoutButton")
    .addEventListener(
      "click",
      async function () {

        await auth.signOut();

      }
    );


  document
    .getElementById("newLoanButton")
    .addEventListener(
      "click",
      abrirModalPrestamo
    );


  document
    .querySelectorAll(".menu-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          abrirPantalla(
            button.dataset.page
          );

        }
      );

    });


configurarFormularioPrestamo();

cargarConfiguracionGeneral();

escucharPrestamos();

escucharPagos();

if (window.lucide) {
  lucide.createIcons();
}

abrirPantalla("inicio");

}

/*=====================================================
 MODAL DE PRÉSTAMO
=====================================================*/

function abrirModalPrestamo() {
  const modal =
    document.getElementById("loanModal");

  modal.classList.remove("hidden");

  cargarDeliveryEnPrestamo();

  const fecha =
    document.getElementById("startDate");

  if (!fecha.value) {
    fecha.value =
      new Date()
        .toISOString()
        .split("T")[0];
  }
}

async function cargarDeliveryEnPrestamo() {
  const selector =
    document.getElementById("collector");

  if (!selector) {
    return;
  }

  selector.innerHTML = `
    <option value="">
      Cargando mensajero...
    </option>
  `;

  try {
    const resultado = await db
      .collection("users")
      .where("role", "==", "delivery")
      .where("status", "==", "activo")
      .get();

    const deliveries =
      resultado.docs.map(function (documento) {
        return {
          id: documento.id,
          ...documento.data()
        };
      });

    if (!deliveries.length) {
      selector.innerHTML = `
        <option value="">
          No hay mensajeros activos
        </option>
      `;

      return;
    }

    selector.innerHTML = `
      <option value="">
        Selecciona un mensajero
      </option>

      ${deliveries
        .map(function (delivery) {
          return `
            <option
              value="${delivery.id}"
              data-name="${escaparHTML(delivery.name || "")}"
            >
              ${escaparHTML(delivery.name || delivery.email)}
            </option>
          `;
        })
        .join("")}
    `;

  } catch (error) {
    console.error(
      "Error cargando mensajero:",
      error
    );

    selector.innerHTML = `
      <option value="">
        No se pudo cargar el mensajero
      </option>
    `;
  }
}

function cerrarModalPrestamo() {
  const modal =
    document.getElementById("loanModal");

  const formulario =
    document.getElementById("loanForm");

  modal.classList.add("hidden");

  formulario.reset();

  document.getElementById(
    "loanMessage"
  ).textContent = "";

  document.getElementById(
    "totalPreview"
  ).textContent = formatoDinero.format(0);

  document.getElementById(
    "installmentPreview"
  ).textContent = formatoDinero.format(0);
}


function configurarFormularioPrestamo() {
  const modal =
    document.getElementById("loanModal");

  const formulario =
    document.getElementById("loanForm");

  const capitalInput =
    document.getElementById("capital");

  const interestInput =
    document.getElementById("interest");

  const installmentsInput =
    document.getElementById("installments");

  const frequencyInput =
    document.getElementById("frequency");

  document
    .getElementById("closeLoanModal")
    .addEventListener(
      "click",
      cerrarModalPrestamo
    );


  document
    .getElementById("cancelLoanButton")
    .addEventListener(
      "click",
      cerrarModalPrestamo
    );


  modal.addEventListener(
    "click",
    function (event) {

      if (event.target === modal) {
        cerrarModalPrestamo();
      }

    }
  );


  capitalInput.addEventListener(
  "input",
  calcularPrestamo
);

frequencyInput.addEventListener(
  "change",
  calcularPrestamo
);


  formulario.addEventListener(
    "submit",
    guardarPrestamo
  );
}

async function cargarConfiguracionGeneral() {
  if (!usuarioActual) {
    return;
  }

  try {
    const documento = await db
      .collection("settings")
      .doc(usuarioActual.uid)
      .get();

    if (!documento.exists) {
      return;
    }

    const configuracion = documento.data();

    configuracionMetricas = {
      ...configuracionMetricas,
      ...configuracion,

      interestByFrequency: {
        ...configuracionMetricas.interestByFrequency,
        ...(configuracion.interestByFrequency || {})
      },

      levels: {
        ...configuracionMetricas.levels,
        ...(configuracion.levels || {})
      }
    };

    calcularPrestamo();

  } catch (error) {
    console.error(
      "Error cargando la configuración general:",
      error
    );
  }
}

function calcularPrestamo() {
  const capital =
    Number(
      document
        .getElementById("capital")
        .value
    ) || 0;

  const frecuencia =
    document
      .getElementById("frequency")
      .value;

  const interesTotalPorcentaje =
    Number(configuracionMetricas.totalInterest || 30);

  const cuotasPorFrecuencia = {
    diario: 30,
    semanal: 6,
    quincenal: 3,
    mensual: 2
  };

  const nombresPeriodo = {
    diario: "días",
    semanal: "semanas",
    quincenal: "quincenas",
    mensual: "meses"
  };

  const cantidadCuotas =
    cuotasPorFrecuencia[frecuencia] || 1;

  const interesMonto =
    capital *
    (interesTotalPorcentaje / 100);

  const total =
    capital + interesMonto;

  const montoCuota =
    cantidadCuotas > 0
      ? total / cantidadCuotas
      : 0;

  const interestInput =
    document.getElementById("interest");

  const installmentsInput =
    document.getElementById("installments");

  interestInput.value =
    `${interesTotalPorcentaje}% — ${formatoDinero.format(interesMonto)}`;

  installmentsInput.value =
    `${cantidadCuotas} ${nombresPeriodo[frecuencia]}`;

  interestInput.dataset.amount =
    interesMonto;

  installmentsInput.dataset.count =
    cantidadCuotas;

  installmentsInput.dataset.unit =
    nombresPeriodo[frecuencia];

  document.getElementById(
    "totalPreview"
  ).textContent =
    formatoDinero.format(total);

  document.getElementById(
    "installmentPreview"
  ).textContent =
    formatoDinero.format(montoCuota);
}


/*=====================================================
 GUARDAR PRÉSTAMO
=====================================================*/

async function guardarPrestamo(event) {
  event.preventDefault();

  if (!usuarioActual) {
    return;
  }

  const boton =
    document.getElementById("saveLoanButton");

  const mensaje =
    document.getElementById("loanMessage");

  const capital =
  Number(
    document
      .getElementById("capital")
      .value
  ) || 0;

const interestInput =
  document.getElementById("interest");

const installmentsInput =
  document.getElementById("installments");

const deliverySelect =
  document.getElementById("collector");

const interes =
  Number(
    interestInput.dataset.amount
  ) || 0;

const cuotas =
  Number(
    installmentsInput.dataset.count
  ) || 0;

const collectorId =
  deliverySelect.value;

const collectorName =
  deliverySelect.options[
    deliverySelect.selectedIndex
  ]?.dataset?.name || "";

const total =
  capital + interes;

const montoCuota =
  cuotas > 0
    ? total / cuotas
    : 0;

if (!collectorId) {
  mensaje.textContent =
    "Debes seleccionar un mensajero.";

  return;
}

if (
  capital <= 0 ||
  cuotas <= 0 ||
  total <= 0
) {
  mensaje.textContent =
    "Revisa el capital y el cálculo del préstamo.";

  return;
}

  boton.disabled = true;
  boton.textContent = "Guardando...";
  mensaje.textContent = "";

  try {

    await db
      .collection("loans")
      .add({

        adminId:
          usuarioActual.uid,

        adminEmail:
          usuarioActual.email,

        clientName:
          document
            .getElementById("clientName")
            .value
            .trim(),

        clientPhone:
          document
            .getElementById("clientPhone")
            .value
            .trim(),

        clientId:
          document
            .getElementById("clientId")
            .value
            .trim(),

        clientAddress:
          document
            .getElementById("clientAddress")
            .value
            .trim(),

        capital:
          capital,

        interest:
          interes,

        totalAmount:
          total,

        installments:
          cuotas,

        installmentAmount:
          montoCuota,

        frequency:
          document
            .getElementById("frequency")
            .value,

        startDate:
          document
            .getElementById("startDate")
            .value,

        collectorId: collectorId,

        collectorName: collectorName,

        paidAmount:
          0,

        pendingAmount:
          total,

        paidInstallments:
          0,

        status:
          "activo",

        createdAt:
          firebase
            .firestore
            .FieldValue
            .serverTimestamp()

      });

    cerrarModalPrestamo();

  }
  catch (error) {

    console.error(
      "Error guardando préstamo:",
      error
    );

    mensaje.textContent =
      "No se pudo guardar el préstamo.";

  }
  finally {

    boton.disabled = false;
    boton.textContent =
      "Guardar préstamo";

  }
}


/*=====================================================
 ESCUCHAR PRÉSTAMOS
=====================================================*/

function escucharPrestamos() {
  if (
    cancelarEscuchaPrestamos
  ) {
    cancelarEscuchaPrestamos();
  }

  cancelarEscuchaPrestamos =
    db
      .collection("loans")
      .where(
        "adminId",
        "==",
        usuarioActual.uid
      )
      .onSnapshot(

        function (snapshot) {

          prestamos =
            snapshot.docs.map(
              function (documento) {

                return {
                  id: documento.id,
                  ...documento.data()
                };

              }
            );

          prestamos =
            ordenarPrestamos(
              prestamos
            );

          const botonActivo =
            document.querySelector(
              ".menu-button.active"
            );

          const paginaActual =
            botonActivo
              ? botonActivo.dataset.page
              : "inicio";

          abrirPantalla(
            paginaActual
          );

        },

        function (error) {

          console.error(
            "Error cargando préstamos:",
            error
          );

        }

      );
}

function escucharPagos() {

  if (!usuarioActual) {
    return;
  }

  if (cancelarEscuchaPagos) {
    cancelarEscuchaPagos();
  }

  cancelarEscuchaPagos =
    db
      .collection("payments")
      .where(
        "adminId",
        "==",
        usuarioActual.uid
      )
      .onSnapshot(

        function (snapshot) {

          pagos =
            snapshot.docs.map(
              function (documento) {

                return {
                  id: documento.id,
                  ...documento.data()
                };

              }
            );

          pagos.sort(function (a, b) {

            const fechaA =
              a.createdAt?.toMillis
                ? a.createdAt.toMillis()
                : 0;

            const fechaB =
              b.createdAt?.toMillis
                ? b.createdAt.toMillis()
                : 0;

            return fechaB - fechaA;

          });

          const botonActivo =
            document.querySelector(
              ".menu-button.active"
            );

          const paginaActual =
            botonActivo
              ? botonActivo.dataset.page
              : "inicio";

          if (paginaActual === "inicio") {
            abrirPantalla("inicio");
          }

        },

        function (error) {

          console.error(
            "Error cargando historial de pagos:",
            error
          );

        }

      );
}

/*=====================================================
 NAVEGACIÓN
=====================================================*/

function abrirPantalla(pagina) {
  const titulo =
    document.getElementById("pageTitle");

  const contenido =
    document.getElementById("pageContent");

    const botonNuevoPrestamo =
  document.getElementById("newLoanButton");

if (botonNuevoPrestamo) {
  botonNuevoPrestamo.style.display =
    ["inicio", "prestamos"].includes(pagina)
      ? "inline-flex"
      : "none";
}

  if (!titulo || !contenido) {
    return;
  }

  document
    .querySelectorAll(".menu-button")
    .forEach(function (button) {

      button.classList.toggle(
        "active",
        button.dataset.page === pagina
      );

    });


  if (pagina === "inicio") {
    mostrarInicio(
      titulo,
      contenido
    );
  }


  if (pagina === "prestamos") {
    mostrarPrestamos(
      titulo,
      contenido
    );
  }


  if (pagina === "archivo") {
    mostrarArchivo(
      titulo,
      contenido
    );
  }


  if (pagina === "metricas") {
    mostrarMetricas(
      titulo,
      contenido
    );
  }


  if (pagina === "mensajeros") {
    mostrarMensajeros(
      titulo,
      contenido
    );
  }


  if (pagina === "pagos") {
    mostrarPagos(
      titulo,
      contenido
    );
  }
}


/*=====================================================
 INICIO
=====================================================*/

function mostrarInicio(
  titulo,
  contenido
) {

  titulo.textContent = "Inicio";

  const activos = prestamos.filter(function (prestamo) {
    return prestamo.status === "activo";
  });

  const dineroEnLaCalle = activos.reduce(function (t, p) {
    return t + Number(p.pendingAmount || 0);
  }, 0);

  const totalCobrado = prestamos.reduce(function (t, p) {
    return t + Number(p.paidAmount || 0);
  }, 0);

  const totalPendiente = activos.reduce(function (t, p) {
    return t + Number(p.pendingAmount || 0);
  }, 0);

  contenido.innerHTML = `

    <section class="welcome-dashboard">

      <div>

        <span class="welcome-label">
          DASHBOARD
        </span>

        <h2>
          Buenos días 👋
        </h2>

        <p>
          Bienvenido nuevamente a SolutionData.
        </p>

      </div>

      <div class="dashboard-date">

        ${new Date().toLocaleDateString("es-DO")}

      </div>

    </section>


    <section class="home-stats-grid">

      <article class="home-stat-card green-card">

        <div class="home-stat-icon">

          💵

        </div>

        <div>

          <span>
            Dinero en la calle
          </span>

          <strong>

            ${formatoDinero.format(dineroEnLaCalle)}

          </strong>

        </div>

      </article>



      <article class="home-stat-card white-card">

        <div class="home-stat-icon">

          ✓

        </div>

        <div>

          <span>
            Cobrado
          </span>

          <strong>

            ${formatoDinero.format(totalCobrado)}

          </strong>

        </div>

      </article>



      <article class="home-stat-card white-card">

        <div class="home-stat-icon">

          !

        </div>

        <div>

          <span>
            Pendiente
          </span>

          <strong class="danger-number">

            ${formatoDinero.format(totalPendiente)}

          </strong>

        </div>

      </article>

    </section>


    <section class="home-content-grid">

      <article class="home-panel">

        <div class="home-panel-header">

          <div>

            <span class="section-label">

              Registro

            </span>

            <h2>

              Última actividad

            </h2>

          </div>

        </div>

        <div class="activity-list">

          ${crearUltimaActividad()}

        </div>

      </article>



      <article class="home-panel">

        <div class="home-panel-header">

          <div>

            <span class="section-label">

              Cobros

            </span>

            <h2>

              Clientes por cobrar

            </h2>

          </div>

        </div>

        <div class="today-clients-list">

          ${crearClientesPorCobrar()}

        </div>

      </article>

    </section>

  `;

lucide.createIcons();

}

function crearUltimaActividad() {

  const actividadesPrestamos =
    prestamos.map(function (prestamo) {

      return {
        tipo: "prestamo",
        fecha: prestamo.createdAt,
        cliente: prestamo.clientName || "Cliente",
        monto: Number(prestamo.totalAmount || 0)
      };

    });

  const actividadesPagos =
    pagos.map(function (pago) {

      return {
        tipo: "pago",
        fecha: pago.createdAt,
        cliente: pago.clientName || "Cliente",
        mensajero:
          pago.collectorName || "Mensajero",
        monto:
          Number(pago.amount || 0),
        saldo:
          Number(pago.newBalance || 0),
        completado:
          pago.loanCompleted === true
      };

    });

  const actividades =
    [
      ...actividadesPrestamos,
      ...actividadesPagos
    ]
      .sort(function (a, b) {

        const fechaA =
          a.fecha?.toMillis
            ? a.fecha.toMillis()
            : 0;

        const fechaB =
          b.fecha?.toMillis
            ? b.fecha.toMillis()
            : 0;

        return fechaB - fechaA;

      })
      .slice(0, 10);

  if (!actividades.length) {

    return `
      <div class="activity-empty">

        <div class="activity-empty-icon">
          <i data-lucide="activity"></i>
        </div>

        <h3>Sin actividad</h3>

        <p>
          Los préstamos y cobros aparecerán aquí.
        </p>

      </div>
    `;

  }

  return actividades
    .map(function (actividad) {

      if (actividad.tipo === "pago") {

        return `
          <article class="activity-item">

            <div class="activity-item-icon payment-activity-icon">
              <i data-lucide="hand-coins"></i>
            </div>

            <div class="activity-description">

              <strong>
                ${escaparHTML(actividad.mensajero)}
                cobró
                ${formatoDinero.format(actividad.monto)}
              </strong>

              <span>
                Cliente:
                ${escaparHTML(actividad.cliente)}
              </span>

              <small>
                ${
                  actividad.completado
                    ? "Préstamo completado"
                    : `Saldo restante: ${formatoDinero.format(
                        actividad.saldo
                      )}`
                }
              </small>

            </div>

          </article>
        `;

      }

      return `
        <article class="activity-item">

          <div class="activity-item-icon">
            <i data-lucide="file-plus-2"></i>
          </div>

          <div class="activity-description">

            <strong>
              Nuevo préstamo registrado
            </strong>

            <span>
              ${escaparHTML(actividad.cliente)}
            </span>

            <small>
              ${formatoDinero.format(actividad.monto)}
            </small>

          </div>

        </article>
      `;

    })
    .join("");
}


function crearClientesPorCobrar() {
  const activos = prestamos
  .filter(function (prestamo) {
    return prestamo.status === "activo";
  })
  .sort(function (a, b) {
    const totalA = Number(a.totalAmount || 0);
    const totalB = Number(b.totalAmount || 0);

    const pagadoA = Number(a.paidAmount || 0);
    const pagadoB = Number(b.paidAmount || 0);

    const progresoA = totalA > 0
      ? pagadoA / totalA
      : 0;

    const progresoB = totalB > 0
      ? pagadoB / totalB
      : 0;

    return progresoB - progresoA;
  })
  .slice(0, 5);

  if (!activos.length) {
    return `
      <div class="activity-empty">

        <div class="activity-empty-icon">
          <i data-lucide="circle-check"></i>
        </div>

        <h3>Sin cobros pendientes</h3>

        <p>
          No hay clientes activos para cobrar.
        </p>

      </div>
    `;
  }

  return activos
    .map(function (prestamo) {
      const total =
        Number(prestamo.totalAmount || 0);

      const pagado =
        Number(prestamo.paidAmount || 0);

      const progreso =
        total > 0
          ? Math.round((pagado / total) * 100)
          : 0;

      return `
        <article class="today-client-card">

          <div class="today-client-top">

            <div class="client-avatar">
              ${obtenerIniciales(prestamo.clientName)}
            </div>

            <div class="client-basic-data">

              <strong>
                ${escaparHTML(prestamo.clientName)}
              </strong>

              <span>
                ${escaparHTML(prestamo.clientPhone)}
              </span>

            </div>

            <span class="client-pending-badge">
              Pendiente
            </span>

          </div>

          <div class="client-payment-data">

            <div>
              <span>Cuota</span>

              <strong>
                ${formatoDinero.format(
                  prestamo.installmentAmount || 0
                )}
              </strong>
            </div>

            <div>
              <span>Restante</span>

              <strong class="danger-number">
                ${formatoDinero.format(
                  prestamo.pendingAmount || 0
                )}
              </strong>
            </div>

          </div>

          <div class="client-progress">

            <div class="progress-information">

              <span>Progreso</span>

              <strong>
                ${progreso}%
              </strong>

            </div>

            <div class="progress-bar">

              <div
                class="progress-value"
                style="width: ${progreso}%"
              ></div>

            </div>

          </div>

        </article>
      `;
    })
    .join("");
}


function obtenerIniciales(nombre) {
  return String(nombre || "Cliente")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(function (palabra) {
      return palabra.charAt(0).toUpperCase();
    })
    .join("");
}

/*=====================================================
 PRÉSTAMOS ACTIVOS
=====================================================*/

function mostrarPrestamos(
  titulo,
  contenido
) {
  titulo.textContent = "Préstamos";

  contenido.innerHTML = `
    <section class="content-card">

      <div class="card-header">

        <div>
          <span class="section-label">
            Cartera activa
          </span>

          <h2>Préstamos activos</h2>
        </div>

      </div>

      <input
        id="loanSearch"
        class="search-input"
        type="search"
        placeholder="Buscar cliente, teléfono, cédula o mensajero"
      />

      <div id="activeLoansContainer"></div>

    </section>
  `;

  const buscador =
    document.getElementById("loanSearch");

  buscador.addEventListener(
    "input",
    function () {

      mostrarListaPrestamosActivos(
        buscador.value
      );

    }
  );

  mostrarListaPrestamosActivos("");
}


function mostrarListaPrestamosActivos(
  texto
) {
  const contenedor =
    document.getElementById(
      "activeLoansContainer"
    );

  if (!contenedor) {
    return;
  }

  const busqueda =
    texto
      .trim()
      .toLowerCase();

  const activos =
    prestamos.filter(
      function (prestamo) {

        if (
          prestamo.status !== "activo"
        ) {
          return false;
        }

        const datos = `
          ${prestamo.clientName || ""}
          ${prestamo.clientPhone || ""}
          ${prestamo.clientId || ""}
          ${prestamo.collector || ""}
          ${prestamo.clientAddress || ""}
        `.toLowerCase();

        return datos.includes(
          busqueda
        );

      }
    );

  contenedor.innerHTML =
    crearListaPrestamos(activos);
}


/*=====================================================
 ARCHIVO
=====================================================*/

function mostrarArchivo(
  titulo,
  contenido
) {
  titulo.textContent = "Archivo";

  const archivados =
    prestamos.filter(
      function (prestamo) {

        return [
          "terminado",
          "eliminado",
          "perdido",
          "cancelado"
        ].includes(
          prestamo.status
        );

      }
    );

  contenido.innerHTML = `
    <section class="content-card">

      <span class="section-label">
        Historial
      </span>

      <h2>Préstamos archivados</h2>

      ${crearListaPrestamos(
        archivados,
        "No hay préstamos archivados."
      )}

    </section>
  `;
}


/*=====================================================
 MÉTRICAS
=====================================================*/

function mostrarMetricas(
  titulo,
  contenido
) {
  titulo.textContent = "Métricas";

  contenido.innerHTML = `
    <section class="content-card metrics-page">

      <div class="card-header">

        <div>
          <span class="section-label">
            Configuración financiera
          </span>

          <h2>
            Intereses y niveles
          </h2>

          <p>
            Ajusta las condiciones utilizadas para calcular
            automáticamente cada préstamo.
          </p>
        </div>

        <button
          type="button"
          id="saveMetricsButton"
          class="primary-button"
        >
          Guardar configuración
        </button>

      </div>


      <section class="metrics-section">

        <div class="metrics-section-title">

          <div>
            <span class="section-label">
              Interés
            </span>

            <h3>
              Configuración de cobros
            </h3>
          </div>

          <span class="metrics-note">
            Valores editables
          </span>

        </div>


        <div class="metrics-grid">

          <label class="metric-input-card main-metric">

            <span>
              Interés total
            </span>

            <div class="metric-input-wrapper">

              <input
                type="number"
                id="totalInterestMetric"
                min="1"
                step="0.01"
                value="30"
              />

              <strong>%</strong>

            </div>

            <small>
              Porcentaje total aplicado al capital.
            </small>

          </label>


          <label class="metric-input-card">

            <span>
              Diario
            </span>

            <div class="metric-input-wrapper">

              <input
                type="number"
                id="dailyInterestMetric"
                min="0.01"
                step="0.01"
                value="1"
              />

              <strong>%</strong>

            </div>

            <small>
              Determina la cantidad de días.
            </small>

          </label>


          <label class="metric-input-card">

            <span>
              Semanal
            </span>

            <div class="metric-input-wrapper">

              <input
                type="number"
                id="weeklyInterestMetric"
                min="0.01"
                step="0.01"
                value="5"
              />

              <strong>%</strong>

            </div>

            <small>
              Determina la cantidad de semanas.
            </small>

          </label>


          <label class="metric-input-card">

            <span>
              Quincenal
            </span>

            <div class="metric-input-wrapper">

              <input
                type="number"
                id="biweeklyInterestMetric"
                min="0.01"
                step="0.01"
                value="10"
              />

              <strong>%</strong>

            </div>

            <small>
              Determina la cantidad de quincenas.
            </small>

          </label>


          <label class="metric-input-card">

            <span>
              Mensual
            </span>

            <div class="metric-input-wrapper">

              <input
                type="number"
                id="monthlyInterestMetric"
                min="0.01"
                step="0.01"
                value="15"
              />

              <strong>%</strong>

            </div>

            <small>
              Determina la cantidad de meses.
            </small>

          </label>

        </div>

      </section>


      <section class="metrics-section">

        <div class="metrics-section-title">

          <div>
            <span class="section-label">
              Clientes
            </span>

            <h3>
              Límites por nivel
            </h3>
          </div>

        </div>


        <div class="levels-grid editable-levels">

          ${crearNivelEditable(1, 5000)}
          ${crearNivelEditable(2, 8000)}
          ${crearNivelEditable(3, 10000)}
          ${crearNivelEditable(4, 15000)}
          ${crearNivelEditable(5, 20000)}
          ${crearNivelEditable(6, 30000)}
          ${crearNivelEditable(7, 50000)}

        </div>

      </section>


      <p
        id="metricsMessage"
        class="message metrics-message"
      ></p>

    </section>
  `;

  document
    .getElementById("saveMetricsButton")
    .addEventListener(
      "click",
      guardarMetricas
    );

    cargarMetricas();
}


function crearNivelEditable(
  nivel,
  monto
) {
  return `
    <label class="editable-level-card">

      <span>
        Nivel ${nivel}
      </span>

      <div class="level-input-wrapper">

        <strong>RD$</strong>

        <input
          type="number"
          id="level${nivel}Metric"
          min="0"
          step="100"
          value="${monto}"
        />

      </div>

    </label>
  `;
}

async function guardarMetricas() {
  const boton =
    document.getElementById("saveMetricsButton");

  const mensaje =
    document.getElementById("metricsMessage");

  const totalInterest =
    Number(
      document.getElementById("totalInterestMetric").value
    );

  const dailyInterest =
    Number(
      document.getElementById("dailyInterestMetric").value
    );

  const weeklyInterest =
    Number(
      document.getElementById("weeklyInterestMetric").value
    );

  const biweeklyInterest =
    Number(
      document.getElementById("biweeklyInterestMetric").value
    );

  const monthlyInterest =
    Number(
      document.getElementById("monthlyInterestMetric").value
    );

  const levels = {
    level1: Number(
      document.getElementById("level1Metric").value
    ),

    level2: Number(
      document.getElementById("level2Metric").value
    ),

    level3: Number(
      document.getElementById("level3Metric").value
    ),

    level4: Number(
      document.getElementById("level4Metric").value
    ),

    level5: Number(
      document.getElementById("level5Metric").value
    ),

    level6: Number(
      document.getElementById("level6Metric").value
    ),

    level7: Number(
      document.getElementById("level7Metric").value
    )
  };

  boton.disabled = true;
  boton.textContent = "Guardando...";
  mensaje.textContent = "";

  try {
    await db
      .collection("settings")
      .doc(usuarioActual.uid)
      .set(
        {
          adminId: usuarioActual.uid,
          adminEmail: usuarioActual.email,

          totalInterest: totalInterest,

          interestByFrequency: {
            daily: dailyInterest,
            weekly: weeklyInterest,
            biweekly: biweeklyInterest,
            monthly: monthlyInterest
          },

          levels: levels,

          updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          merge: true
        }
      );

configuracionMetricas = {
  totalInterest: totalInterest,

  interestByFrequency: {
    daily: dailyInterest,
    weekly: weeklyInterest,
    biweekly: biweeklyInterest,
    monthly: monthlyInterest
  },

  levels: levels
};

    mensaje.style.color = "#15803d";
    mensaje.textContent =
      "Configuración guardada correctamente.";
  }
  catch (error) {
    console.error(
      "Error guardando métricas:",
      error
    );

    mensaje.style.color = "#b42318";
    mensaje.textContent =
      "No se pudo guardar la configuración.";
  }
  finally {
    boton.disabled = false;
    boton.textContent =
      "Guardar configuración";
  }
}

async function cargarMetricas() {
  try {
    const documento = await db
      .collection("settings")
      .doc(usuarioActual.uid)
      .get();

    if (!documento.exists) {
      return;
    }

    const configuracion = documento.data();

    document.getElementById(
      "totalInterestMetric"
    ).value =
      configuracion.totalInterest ?? 30;

    document.getElementById(
      "dailyInterestMetric"
    ).value =
      configuracion.interestByFrequency?.daily ?? 1;

    document.getElementById(
      "weeklyInterestMetric"
    ).value =
      configuracion.interestByFrequency?.weekly ?? 5;

    document.getElementById(
      "biweeklyInterestMetric"
    ).value =
      configuracion.interestByFrequency?.biweekly ?? 10;

    document.getElementById(
      "monthlyInterestMetric"
    ).value =
      configuracion.interestByFrequency?.monthly ?? 15;

    document.getElementById(
      "level1Metric"
    ).value =
      configuracion.levels?.level1 ?? 5000;

    document.getElementById(
      "level2Metric"
    ).value =
      configuracion.levels?.level2 ?? 8000;

    document.getElementById(
      "level3Metric"
    ).value =
      configuracion.levels?.level3 ?? 10000;

    document.getElementById(
      "level4Metric"
    ).value =
      configuracion.levels?.level4 ?? 15000;

    document.getElementById(
      "level5Metric"
    ).value =
      configuracion.levels?.level5 ?? 20000;

    document.getElementById(
      "level6Metric"
    ).value =
      configuracion.levels?.level6 ?? 30000;

    document.getElementById(
      "level7Metric"
    ).value =
      configuracion.levels?.level7 ?? 50000;

  } catch (error) {
    console.error(
      "Error cargando métricas:",
      error
    );
  }
}

/*=====================================================
 MENSAJEROS
=====================================================*/

function mostrarMensajeros(
  titulo,
  contenido
) {
  titulo.textContent = "Mensajeros";

  contenido.innerHTML = `
    <section class="content-card">

      <div class="card-header">

        <div>
          <span class="section-label">
            Equipo de cobros
          </span>

          <h2>Mensajeros</h2>

          <p>
            Registra los mensajeros que cobrarán
            los préstamos asignados.
          </p>
        </div>

        <button
          type="button"
          id="addMessengerButton"
          class="primary-button"
        >
          Agregar mensajero
        </button>

      </div>

      <div
        id="messengersContainer"
        class="messengers-grid"
      >
        <div class="empty-state">
          <h3>Cargando mensajeros...</h3>
        </div>
      </div>

    </section>


    <div
      id="messengerModal"
      class="loan-modal hidden"
    >

      <section class="loan-modal-card messenger-modal-card">

        <div class="loan-modal-header">

          <div>
            <span class="section-label">
              Nuevo registro
            </span>

            <h2>Agregar mensajero</h2>
          </div>

          <button
            type="button"
            id="closeMessengerModal"
            class="close-modal-button"
          >
            ×
          </button>

        </div>

        <form id="messengerForm">

          <div class="loan-form-grid">

            <label>
              Nombre completo

              <input
                type="text"
                id="messengerName"
                placeholder="Nombre del mensajero"
                required
              />
            </label>

            <label>
              Teléfono

              <input
                type="tel"
                id="messengerPhone"
                placeholder="809-000-0000"
                required
              />
            </label>

            <label>
              Correo electrónico

              <input
                type="email"
                id="messengerEmail"
                placeholder="mensajero@correo.com"
                required
              />
            </label>

            <label>
              Cédula

              <input
                type="text"
                id="messengerId"
                placeholder="000-0000000-0"
              />
            </label>

            <label>
              Sueldo fijo

              <input
                type="number"
                id="messengerSalary"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Meta de cobro

              <input
                type="number"
                id="messengerGoal"
                min="0"
                step="0.01"
                placeholder="Ejemplo: 50000"
                required
              />
            </label>

            <label>
              Comisión al superar la meta

              <input
                type="number"
                id="messengerCommission"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Estado

              <select id="messengerStatus" required>
                <option value="activo">
                  Activo
                </option>

                <option value="bloqueado">
                  Bloqueado
                </option>
              </select>
            </label>

          </div>

          <p
            id="messengerMessage"
            class="message"
          ></p>

          <div class="loan-form-actions">

            <button
              type="button"
              id="cancelMessengerButton"
              class="secondary-button"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="saveMessengerButton"
              class="primary-button"
            >
              Guardar mensajero
            </button>

          </div>

        </form>

      </section>

    </div>
  `;

  document
    .getElementById("addMessengerButton")
    .addEventListener(
      "click",
      abrirModalMensajero
    );

  document
    .getElementById("closeMessengerModal")
    .addEventListener(
      "click",
      cerrarModalMensajero
    );

  document
    .getElementById("cancelMessengerButton")
    .addEventListener(
      "click",
      cerrarModalMensajero
    );

  document
    .getElementById("messengerForm")
    .addEventListener(
      "submit",
      guardarMensajero
    );

  cargarMensajeros();
}

function abrirModalMensajero() {
  const modal =
    document.getElementById("messengerModal");

  modal.classList.remove("hidden");
}


function cerrarModalMensajero() {
  const modal =
    document.getElementById("messengerModal");

  const formulario =
    document.getElementById("messengerForm");

  modal.classList.add("hidden");
  formulario.reset();

  document.getElementById(
    "messengerMessage"
  ).textContent = "";
}


async function guardarMensajero(event) {
  event.preventDefault();

  const boton =
    document.getElementById("saveMessengerButton");

  const mensaje =
    document.getElementById("messengerMessage");

  boton.disabled = true;
  boton.textContent = "Guardando...";
  mensaje.textContent = "";

  try {
    await db
      .collection("messengers")
      .add({
        adminId: usuarioActual.uid,
        adminEmail: usuarioActual.email,

        name:
          document
            .getElementById("messengerName")
            .value
            .trim(),

        phone:
          document
            .getElementById("messengerPhone")
            .value
            .trim(),

        email:
          document
            .getElementById("messengerEmail")
            .value
            .trim()
            .toLowerCase(),

        identification:
          document
            .getElementById("messengerId")
            .value
            .trim(),

        salary:
          Number(
            document
              .getElementById("messengerSalary")
              .value
          ) || 0,

        goal:
          Number(
            document
              .getElementById("messengerGoal")
              .value
          ) || 0,

        commission:
          Number(
            document
              .getElementById("messengerCommission")
              .value
          ) || 0,

        status:
          document
            .getElementById("messengerStatus")
            .value,

        role: "delivery",

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });

    cerrarModalMensajero();
    cargarMensajeros();

  } catch (error) {
    console.error(
      "Error guardando mensajero:",
      error
    );

    mensaje.textContent =
      "No se pudo guardar el mensajero.";
  } finally {
    boton.disabled = false;
    boton.textContent =
      "Guardar mensajero";
  }
}


async function cargarMensajeros() {
  const contenedor =
    document.getElementById("messengersContainer");

  if (!contenedor || !usuarioActual) {
    return;
  }

  contenedor.innerHTML = `
    <div class="empty-state">
      <h3>Cargando mensajeros...</h3>
    </div>
  `;

  try {
    const resultado = await db
      .collection("messengers")
      .where(
        "adminId",
        "==",
        usuarioActual.uid
      )
      .get();

    const mensajeros =
      resultado.docs.map(function (documento) {
        return {
          id: documento.id,
          ...documento.data()
        };
      });

    if (!mensajeros.length) {
      contenedor.innerHTML = `
        <div class="empty-state">
          <h3>No hay mensajeros registrados</h3>

          <p>
            Usa el botón “Agregar mensajero”
            para crear el primero.
          </p>
        </div>
      `;

      return;
    }

    contenedor.innerHTML =
      mensajeros
        .map(function (mensajero) {
          const estadoActivo =
            mensajero.status === "activo";

          return `
            <article class="messenger-card">

              <div class="messenger-card-header">

                <div class="messenger-avatar">
                  ${obtenerIniciales(mensajero.name)}
                </div>

                <div>
                  <h3>
                    ${escaparHTML(mensajero.name)}
                  </h3>

                  <p>
                    ${escaparHTML(mensajero.email)}
                  </p>
                </div>

                <span
                  class="messenger-status ${
                    estadoActivo
                      ? "active"
                      : "blocked"
                  }"
                >
                  ${escaparHTML(mensajero.status)}
                </span>

              </div>

              <div class="messenger-data-grid">

                <div>
                  <span>Teléfono</span>

                  <strong>
                    ${escaparHTML(mensajero.phone)}
                  </strong>
                </div>

                <div>
                  <span>Sueldo fijo</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(mensajero.salary || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Meta de cobro</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(mensajero.goal || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Comisión</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(mensajero.commission || 0)
                    )}
                  </strong>
                </div>

              </div>

            </article>
          `;
        })
        .join("");

  } catch (error) {
    console.error(
      "Error cargando mensajeros:",
      error
    );

    contenedor.innerHTML = `
      <div class="empty-state">
        <h3>No se pudieron cargar</h3>

        <p>
          Revisa las reglas de Firebase.
        </p>
      </div>
    `;
  }
}

/*=====================================================
 PAGOS DE MENSAJEROS
=====================================================*/

function mostrarPagos(
  titulo,
  contenido
) {
  titulo.textContent = "Pagos";

  contenido.innerHTML = `
    <section class="content-card">

      <span class="section-label">
        Nómina
      </span>

      <h2>Pagos de mensajeros</h2>

      <div class="empty-state">

        <h3>No hay pagos registrados</h3>

        <p>
          Aquí aparecerán el sueldo fijo,
          las comisiones y los recibos.
        </p>

      </div>

    </section>
  `;
}


/*=====================================================
 TARJETAS DE PRÉSTAMOS
=====================================================*/

function crearListaPrestamos(
  lista,
  mensajeVacio = "No hay préstamos registrados."
) {
  if (!lista.length) {
    return `
      <div class="empty-state">
        <h3>Sin registros</h3>
        <p>${mensajeVacio}</p>
      </div>
    `;
  }

  return `
    <div class="loans-list">

      ${lista
        .map(function (prestamo) {
          return `
            <article class="loan-card">

              <div class="loan-card-header">

                <div>

                  <span class="loan-status">
                    ${escaparHTML(prestamo.status)}
                  </span>

                  <h3>
                    ${escaparHTML(prestamo.clientName)}
                  </h3>

                  <p>
                    ${escaparHTML(prestamo.clientPhone)}
                  </p>

                  <p>
                    ${escaparHTML(prestamo.clientAddress)}
                  </p>

                </div>

                <div class="loan-actions">

  ${
    prestamo.status === "activo"
      ? `
        <button
          type="button"
          class="loan-action-button"
          onclick="marcarPrestamoTerminado('${prestamo.id}')"
        >
          Completar
        </button>

        <button
          type="button"
          class="loan-action-button danger"
          onclick="moverPrestamoAEliminados('${prestamo.id}')"
        >
          Eliminar
        </button>
      `
      : ""
  }

  ${
    [
  "eliminado",
  "terminado",
  "perdido",
  "cancelado"
].includes(prestamo.status)
      ? `
        <button
          type="button"
          class="loan-action-button"
          onclick="restaurarPrestamo('${prestamo.id}')"
        >
          Restaurar
        </button>

        <button
          type="button"
          class="loan-action-button danger"
          onclick="eliminarPrestamoDefinitivamente('${prestamo.id}')"
        >
          Eliminar definitivamente
        </button>
      `
      : ""
  }

</div>

              </div>

              <div class="loan-values">

                <div>
                  <span>Capital</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(prestamo.capital || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Interés</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(prestamo.interest || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Total</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(prestamo.totalAmount || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Cuota</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(prestamo.installmentAmount || 0)
                    )}
                  </strong>
                </div>

                <div>
                  <span>Pendiente</span>

                  <strong>
                    ${formatoDinero.format(
                      Number(prestamo.pendingAmount || 0)
                    )}
                  </strong>
                </div>

              </div>

              <div class="loan-footer">

                <span>
                  ${escaparHTML(prestamo.frequency || "")}
                </span>

                <span>
                  Inicio:
                  ${escaparHTML(prestamo.startDate || "")}
                </span>

              </div>

            </article>
          `;
        })
        .join("")}

    </div>
  `;
}

async function marcarPrestamoTerminado(prestamoId) {
  const confirmar = confirm(
    "¿Deseas marcar este préstamo como terminado?"
  );

  if (!confirmar) {
    return;
  }

  try {
    await db
      .collection("loans")
      .doc(prestamoId)
      .update({
        status: "terminado",
        completedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error(
      "Error terminando préstamo:",
      error
    );

    alert("No se pudo terminar el préstamo.");
  }
}


async function moverPrestamoAEliminados(prestamoId) {
  const confirmar = confirm(
    "¿Deseas mover este préstamo a eliminados?"
  );

  if (!confirmar) {
    return;
  }

  try {
    await db
      .collection("loans")
      .doc(prestamoId)
      .update({
        status: "eliminado",
        deletedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error(
      "Error moviendo préstamo:",
      error
    );

    alert("No se pudo mover el préstamo a eliminados.");
  }
}

async function restaurarPrestamo(prestamoId) {
  const confirmar = confirm(
    "¿Deseas restaurar este préstamo?"
  );

  if (!confirmar) {
    return;
  }

  try {
    await db
      .collection("loans")
      .doc(prestamoId)
      .update({
        status: "activo",
        restoredAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error(
      "Error restaurando préstamo:",
      error
    );

    alert("No se pudo restaurar el préstamo.");
  }
}


async function eliminarPrestamoDefinitivamente(prestamoId) {
  const confirmar = confirm(
    "¿Seguro que deseas eliminar este préstamo para siempre? Esta acción no se puede deshacer."
  );

  if (!confirmar) {
    return;
  }

  const segundaConfirmacion = confirm(
    "Confirma nuevamente: el préstamo será borrado definitivamente de Firebase."
  );

  if (!segundaConfirmacion) {
    return;
  }

  try {
    await db
      .collection("loans")
      .doc(prestamoId)
      .delete();

    alert("Préstamo eliminado definitivamente.");
  } catch (error) {
    console.error(
      "Error eliminando préstamo definitivamente:",
      error
    );

    alert("No se pudo eliminar el préstamo.");
  }
}

function mostrarPanelDelivery(usuario) {
  usuarioActual = usuario;

  app.innerHTML = `
    <div class="dashboard-layout">

      <aside class="sidebar">

        <div class="sidebar-brand">
          <strong>SolutionData</strong>
          <span>Panel del mensajero</span>
        </div>

        <nav class="sidebar-menu">

          <button
            class="menu-button active"
            data-delivery-page="inicio"
          >
            <i data-lucide="house"></i>
            <span>Inicio</span>
          </button>

          <button
            class="menu-button"
            data-delivery-page="cobros"
          >
            <i data-lucide="hand-coins"></i>
            <span>Clientes por cobrar</span>
          </button>

          <button
            class="menu-button"
            data-delivery-page="historial"
          >
            <i data-lucide="history"></i>
            <span>Historial</span>
          </button>

          <button
            class="menu-button"
            data-delivery-page="sueldo"
          >
            <i data-lucide="wallet"></i>
            <span>Mi sueldo</span>
          </button>

        </nav>

        <button
          id="deliveryLogoutButton"
          class="logout-button"
        >
          <i data-lucide="log-out"></i>
          <span>Cerrar sesión</span>
        </button>

      </aside>

      <main class="main-content">

        <header class="topbar">

          <div>
            <span class="section-label">
              SolutionData
            </span>

            <h1 id="deliveryPageTitle">
              Inicio
            </h1>

            <p>
              ${escaparHTML(usuario.email)}
            </p>
          </div>

        </header>

                <section id="deliveryPageContent"></section>

      </main>

    </div>


    <div
  id="deliveryPaymentModal"
  class="loan-modal hidden"
>
  <section class="delivery-payment-modal-card">

    <div class="delivery-payment-header">

      <div class="delivery-payment-icon">
        <i data-lucide="hand-coins"></i>
      </div>

      <div>
        <span class="section-label">
          Registro de cobro
        </span>

        <h2>Aplicar pago</h2>

        <p>
          Confirma el monto recibido del cliente.
        </p>
      </div>

      <button
        type="button"
        id="closeDeliveryPaymentModal"
        class="close-modal-button"
      >
        ×
      </button>

    </div>

    <form id="deliveryPaymentForm">

      <input
        type="hidden"
        id="deliveryPaymentLoanId"
      />

      <section class="delivery-payment-client">

        <div class="delivery-payment-avatar">
          <i data-lucide="user"></i>
        </div>

        <div>
          <span>Cliente</span>

          <strong id="deliveryPaymentClientName">
            Cliente
          </strong>
        </div>

      </section>

      <section class="delivery-payment-summary">

        <article>
          <span>Saldo pendiente</span>

          <strong id="deliveryPaymentPendingText">
            RD$0.00
          </strong>
        </article>

        <article>
          <span>Cuota sugerida</span>

          <strong id="deliveryPaymentSuggestedText">
            RD$0.00
          </strong>
        </article>

      </section>

      <label class="delivery-payment-amount-field">

        <span>Monto recibido</span>

        <div class="delivery-payment-input-wrapper">

          <strong>RD$</strong>

          <input
            type="number"
            id="deliveryPaymentAmount"
            min="1"
            step="1"
            inputmode="numeric"
            placeholder="0.00"
            required
          />

        </div>

        <small>
          Puedes registrar la cuota completa o un pago parcial.
        </small>

      </label>

      <p
        id="deliveryPaymentMessage"
        class="message"
      ></p>

      <div class="delivery-payment-actions">

        <button
          type="button"
          id="cancelDeliveryPaymentButton"
          class="secondary-button"
        >
          Cancelar
        </button>

        <button
          type="submit"
          id="saveDeliveryPaymentButton"
          class="primary-button"
        >
          <i data-lucide="check"></i>
          Aplicar pago
        </button>

      </div>

    </form>

  </section>
</div>

      <section class="loan-modal-card">

        <div class="loan-modal-header">

          <div>
            <span class="section-label">
              Nuevo cobro
            </span>

            <h2>Registrar pago</h2>
          </div>

          <button
            type="button"
            id="closeDeliveryPaymentModal"
            class="close-modal-button"
          >
            ×
          </button>

        </div>

        <form id="deliveryPaymentForm">

          <input
            type="hidden"
            id="deliveryPaymentLoanId"
          />

          <div class="loan-form-grid">

            <label>
              Cliente

              <input
                type="text"
                id="deliveryPaymentClient"
                readonly
              />
            </label>

            <label>
              Saldo pendiente

              <input
                type="text"
                id="deliveryPaymentPending"
                readonly
              />
            </label>

            <label>
              Cuota sugerida

              <input
                type="text"
                id="deliveryPaymentSuggested"
                readonly
              />
            </label>

            <label>
              Monto recibido

              <input
                type="number"
                id="deliveryPaymentAmount"
                min="1"
                step="0.01"
                required
              />
            </label>

          </div>

          <p
            id="deliveryPaymentMessage"
            class="message"
          ></p>

          <div class="loan-form-actions">

            <button
              type="button"
              id="cancelDeliveryPaymentButton"
              class="secondary-button"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="saveDeliveryPaymentButton"
              class="primary-button"
            >
              Aplicar pago
            </button>

          </div>

        </form>

      </section>
    </div>
  `;

  document
    .getElementById("deliveryLogoutButton")
    .addEventListener(
      "click",
      async function () {
        await auth.signOut();
      }
    );

  document
    .querySelectorAll("[data-delivery-page]")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          abrirPantallaDelivery(
            button.dataset.deliveryPage
          );
        }
      );
    });

  abrirPantallaDelivery("inicio");

  document
  .getElementById(
    "closeDeliveryPaymentModal"
  )
  .addEventListener(
    "click",
    cerrarModalPagoDelivery
  );

document
  .getElementById(
    "cancelDeliveryPaymentButton"
  )
  .addEventListener(
    "click",
    cerrarModalPagoDelivery
  );

  document
  .getElementById(
    "deliveryPaymentForm"
  )
  .addEventListener(
    "submit",
    guardarPagoDelivery
  );

  if (window.lucide) {
    lucide.createIcons();
  }
}

async function cargarPrestamosDelivery() {
  const contenedor =
    document.getElementById("deliveryLoansContainer");

  if (!contenedor || !usuarioActual) {
    return;
  }

  try {
    const resultado = await db
      .collection("loans")
      .where(
        "collectorId",
        "==",
        usuarioActual.uid
      )
      .get();

    const prestamosDelivery =
      resultado.docs
        .map(function (documento) {
          return {
            id: documento.id,
            ...documento.data()
          };
        })
        .filter(function (prestamo) {
          return prestamo.status === "activo";
        });

    if (!prestamosDelivery.length) {
      contenedor.innerHTML = `
        <div class="empty-state">

          <h3>No hay clientes asignados</h3>

          <p>
            Cuando el administrador te asigne un préstamo,
            aparecerá aquí.
          </p>

        </div>
      `;

      return;
    }

    contenedor.innerHTML =
      prestamosDelivery
        .map(function (prestamo) {
          const total =
            Number(prestamo.totalAmount || 0);

          const pagado =
            Number(prestamo.paidAmount || 0);

          const pendiente =
            Number(prestamo.pendingAmount || 0);

          const progreso =
            total > 0
              ? Math.round((pagado / total) * 100)
              : 0;

          return `
  <article class="loan-card delivery-client-card">

    <div class="delivery-client-header">

      <div class="delivery-client-profile">

        <div class="delivery-client-avatar">
          ${obtenerIniciales(prestamo.clientName)}
        </div>

        <div class="delivery-client-information">

          <div class="delivery-client-name-row">

            <h3>
              ${escaparHTML(prestamo.clientName)}
            </h3>

            <span class="loan-status">
              Activo
            </span>

          </div>

          <p>
            <i data-lucide="phone"></i>

            ${escaparHTML(prestamo.clientPhone)}
          </p>

          <p>
            <i data-lucide="map-pin"></i>

            ${escaparHTML(prestamo.clientAddress)}
          </p>

        </div>

      </div>

      <button
        type="button"
        class="delivery-pay-button"
        onclick="abrirModalPagoDelivery('${prestamo.id}')"
      >
        <i data-lucide="hand-coins"></i>

        <span>Registrar pago</span>
      </button>

    </div>


    <div class="delivery-loan-financial-grid">

      <article>
        <span>Cuota</span>

        <strong>
          ${formatoDinero.format(
            Number(prestamo.installmentAmount || 0)
          )}
        </strong>
      </article>

      <article>
        <span>Pagado</span>

        <strong class="success-number">
          ${formatoDinero.format(pagado)}
        </strong>
      </article>

      <article>
        <span>Pendiente</span>

        <strong class="danger-number">
          ${formatoDinero.format(pendiente)}
        </strong>
      </article>

      <article>
        <span>Progreso</span>

        <strong>
          ${progreso}%
        </strong>
      </article>

    </div>


    <div class="delivery-loan-progress">

      <div class="delivery-progress-information">

        <span>Progreso del préstamo</span>

        <strong>
          ${progreso}%
        </strong>

      </div>

      <div class="progress-bar">

        <div
          class="progress-value"
          style="width: ${progreso}%"
        ></div>

      </div>

    </div>


    <div class="delivery-loan-footer">

      <span>
        <i data-lucide="calendar-days"></i>

        Inicio:
        ${escaparHTML(prestamo.startDate || "")}
      </span>

      <span>
        <i data-lucide="repeat-2"></i>

        ${escaparHTML(prestamo.frequency || "")}
      </span>

    </div>

  </article>
`;
        })
        .join("");

  } catch (error) {
    console.error(
      "Error cargando préstamos del delivery:",
      error
    );

    contenedor.innerHTML = `
      <div class="empty-state">

        <h3>No se pudieron cargar los clientes</h3>

        <p>
          Revisa la consola y las reglas de Firebase.
        </p>

      </div>
    `;
  }
}

let prestamoSeleccionado = null;

async function abrirModalPagoDelivery(prestamoId) {

  try {

    const documento =
      await db
        .collection("loans")
        .doc(prestamoId)
        .get();

    if (!documento.exists) {

      alert("No se encontró el préstamo.");

      return;

    }

    prestamoSeleccionado = {

      id: documento.id,

      ...documento.data()

    };

    document.getElementById(
      "deliveryPaymentLoanId"
    ).value = prestamoSeleccionado.id;

    document.getElementById(
      "deliveryPaymentClientName"
    ).textContent =
      prestamoSeleccionado.clientName || "Cliente";

    document.getElementById(
      "deliveryPaymentPendingText"
    ).textContent =
      formatoDinero.format(
        Number(
          prestamoSeleccionado.pendingAmount || 0
        )
      );

    document.getElementById(
      "deliveryPaymentAmount"
    ).value = "";

    document.getElementById(
      "deliveryPaymentMessage"
    ).textContent = "";

    document
      .getElementById(
        "deliveryPaymentModal"
      )
      .classList.remove("hidden");

    if (window.lucide) {
      lucide.createIcons();

    }

}

  catch (error) {

    console.error(error);

    alert("No se pudo abrir el préstamo.");

  }

}

function cerrarModalPagoDelivery() {

  prestamoSeleccionado = null;

  document
    .getElementById(
      "deliveryPaymentModal"
    )
    .classList.add("hidden");

}

async function guardarPagoDelivery(event) {
  event.preventDefault();

  const mensaje =
    document.getElementById(
      "deliveryPaymentMessage"
    );

  const boton =
    document.getElementById(
      "saveDeliveryPaymentButton"
    );

  const monto =
    Number(
      document.getElementById(
        "deliveryPaymentAmount"
      ).value
    ) || 0;

  if (!prestamoSeleccionado) {
    mensaje.textContent =
      "No se encontró el préstamo seleccionado.";

    return;
  }

  const saldoPendiente =
    Number(
      prestamoSeleccionado.pendingAmount || 0
    );

  if (monto <= 0) {
    mensaje.textContent =
      "Escribe un monto válido.";

    return;
  }

  if (monto > saldoPendiente) {
    mensaje.textContent =
      "El pago no puede ser mayor que el saldo pendiente.";

    return;
  }

  boton.disabled = true;
  boton.textContent = "Aplicando...";

  const nuevoPagado =
  Number(
    prestamoSeleccionado.paidAmount || 0
  ) + monto;

const nuevoPendiente =
  saldoPendiente - monto;

  const prestamoCompletado =
  nuevoPendiente <= 0;

const nuevoProgreso =
  Number(
    prestamoSeleccionado.totalAmount || 0
  ) > 0
    ? Math.round(
        (
          nuevoPagado /
          Number(
            prestamoSeleccionado.totalAmount
          )
        ) * 100
      )
    : 100;

  try {

  const referenciaPrestamo =
  db
    .collection("loans")
    .doc(prestamoSeleccionado.id);

const referenciaPago =
  db
    .collection("payments")
    .doc();

const lote =
  db.batch();

lote.update(
  referenciaPrestamo,
  {
    paidAmount:
      nuevoPagado,

    pendingAmount:
      Math.max(nuevoPendiente, 0),

    progress:
      prestamoCompletado
        ? 100
        : nuevoProgreso,

    status:
      prestamoCompletado
        ? "terminado"
        : "activo",

    completedAt:
      prestamoCompletado
        ? firebase.firestore.FieldValue.serverTimestamp()
        : null,

    lastPaymentDate:
      firebase.firestore.FieldValue.serverTimestamp()
  }
);

lote.set(
  referenciaPago,
  {
    paymentId:
      referenciaPago.id,

    loanId:
      prestamoSeleccionado.id,

    adminId:
      prestamoSeleccionado.adminId,

    adminEmail:
      prestamoSeleccionado.adminEmail || "",

    clientName:
      prestamoSeleccionado.clientName || "",

    clientPhone:
      prestamoSeleccionado.clientPhone || "",

    collectorId:
      usuarioActual.uid,

    collectorName:
      prestamoSeleccionado.collectorName
      || usuarioActual.email
      || "Mensajero",

    amount:
      monto,

    previousBalance:
      saldoPendiente,

    newBalance:
      Math.max(nuevoPendiente, 0),

    loanCompleted:
      prestamoCompletado,

    paymentMethod:
      "efectivo",

    status:
      "aplicado",

    createdAt:
      firebase.firestore.FieldValue.serverTimestamp()
  }
);

await lote.commit();

  mensaje.style.color = "#15803d";

  mensaje.textContent =
    "Pago aplicado correctamente.";

 cerrarModalPagoDelivery();

 await cargarPrestamosDelivery();

}

catch (error) {

  console.error(error);

  mensaje.style.color = "#b42318";

  mensaje.textContent =
    "No se pudo registrar el pago.";

}

  boton.disabled = false;
  boton.innerHTML = `
    <i data-lucide="check"></i>
    Aplicar pago
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

function abrirPantallaDelivery(pagina) {
  const titulo =
    document.getElementById("deliveryPageTitle");

  const contenido =
    document.getElementById("deliveryPageContent");

  if (!titulo || !contenido) {
    return;
  }

  document
    .querySelectorAll("[data-delivery-page]")
    .forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.deliveryPage === pagina
      );
    });

  if (pagina === "inicio") {
    titulo.textContent = "Inicio";

    contenido.innerHTML = `
      <section class="stats-grid">

        <article class="stat-card">
          <span>Clientes asignados</span>
          <strong>0</strong>
        </article>

        <article class="stat-card">
          <span>Cobrado hoy</span>
          <strong>RD$0.00</strong>
        </article>

        <article class="stat-card">
          <span>Pendiente hoy</span>
          <strong>RD$0.00</strong>
        </article>

        <article class="stat-card">
          <span>Progreso</span>
          <strong>0%</strong>
        </article>

      </section>

      <section class="content-card">

        <span class="section-label">
          Resumen
        </span>

        <h2>Actividad del día</h2>

        <div class="empty-state">
          <h3>Sin actividad registrada</h3>

          <p>
            Aquí aparecerán los pagos y cobros realizados.
          </p>
        </div>

      </section>
    `;
  }

  if (pagina === "cobros") {
  titulo.textContent = "Clientes por cobrar";

  contenido.innerHTML = `
    <section class="content-card">

      <span class="section-label">
        Cobros asignados
      </span>

      <h2>Clientes por cobrar</h2>

      <div
        id="deliveryLoansContainer"
        class="loans-list"
      >
        <div class="empty-state">
          <h3>Cargando clientes...</h3>
        </div>
      </div>

    </section>
  `;

  cargarPrestamosDelivery();
}

  if (pagina === "historial") {
    titulo.textContent = "Historial";

    contenido.innerHTML = `
      <section class="content-card">

        <span class="section-label">
          Movimientos
        </span>

        <h2>Historial de cobros</h2>

        <div class="empty-state">
          <h3>Sin movimientos</h3>

          <p>
            Aquí aparecerán todos los pagos registrados.
          </p>
        </div>

      </section>
    `;
  }

  if (pagina === "sueldo") {
    titulo.textContent = "Mi sueldo";

    contenido.innerHTML = `
      <section class="content-card">

        <span class="section-label">
          Nómina
        </span>

        <h2>Resumen de pago</h2>

        <div class="empty-state">
          <h3>Sin información de pago</h3>

          <p>
            Aquí aparecerán sueldo fijo, comisión y total.
          </p>
        </div>

      </section>
    `;
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/*=====================================================
 CONTROL DE AUTENTICACIÓN
=====================================================*/

auth.onAuthStateChanged(
  async function (usuario) {

    if (!usuario) {

      if (cancelarEscuchaPrestamos) {
        cancelarEscuchaPrestamos();
        cancelarEscuchaPrestamos = null;
      }

      usuarioActual = null;
      prestamos = [];

      mostrarLogin();
      return;
    }

    try {

      const documento =
        await db
          .collection("users")
          .doc(usuario.uid)
          .get();

      if (!documento.exists) {

        alert(
          "Este usuario no tiene permisos para entrar."
        );

        await auth.signOut();
        return;

      }

      const datos = documento.data();

      if (datos.status !== "activo") {

        alert(
          "Este usuario está bloqueado."
        );

        await auth.signOut();
        return;

      }

      if (datos.role === "admin") {

        mostrarDashboard(usuario);

      }
      else if (datos.role === "delivery") {

        mostrarPanelDelivery(usuario);

      }
      else {

        alert("Rol desconocido.");

        await auth.signOut();

      }

    }
    catch (error) {

      console.error(error);

      await auth.signOut();

    }

  }
);